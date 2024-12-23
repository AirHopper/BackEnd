import prisma from '../utils/prisma.js';
import { createQrCodeUrlByOrderId } from '../utils/qrCode.js';
import { add } from "date-fns";
import { createPdfUrlByOrderId } from '../utils/pdfKit.js';
import AppError from '../utils/AppError.js';

export const getAllUserOwnedOrders = async ({userId, search}) => {
    try {
        const { orderId, startBookingDate, endBookingDate } = search || {};

        const isValidDate = (date) => {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate);
        };

        // Validate startBookingDate and endBookingDate
        if (startBookingDate && !isValidDate(startBookingDate)) {
            throw new AppError('Invalid startBookingDate', 400);
        }
        if (endBookingDate && !isValidDate(endBookingDate)) {
            throw new AppError('Invalid endBookingDate', 400);
        }
        if (startBookingDate && endBookingDate && new Date(startBookingDate) > new Date(endBookingDate)) {
            throw new AppError('startBookingDate must be before endBookingDate', 400);
        }

        // seatch filter for order id, start booking date, and end booking date
        const searchFilters = {
            AND: [
                ...(orderId ? [{ id: { contains: orderId, mode: "insensitive" } }] : []),
                ...(startBookingDate || endBookingDate
                    ?   [
                            {
                                bookingDate: {
                                    ...(startBookingDate ? { gte: new Date(startBookingDate).toISOString() } : {}),
                                    ...(endBookingDate ? { lte: new Date(new Date(endBookingDate).setDate(new Date(endBookingDate).getDate() + 1)).toISOString() } : {})
                                }
                            }
                    ]
                    : [])
            ]
        };

        const orders = await prisma.order.findMany({
            where: {
                userId,
                ...searchFilters
            },
            include: {
                Payment: true,
                Passengers: {
                    include: {
                        Seat: {
                            include: {
                                Flight: {
                                    include: {
                                        Route: true,
                                        Airplane: {
                                            include: {
                                                Airline: true
                                            }
                                        },
                                        DepartureTerminal: true,
                                        ArrivalTerminal: true
                                    }
                                }
                            }
                        }
                    }
                },
                OutboundTicket: {
                    include: {
                        Flights: {
                            include: {
                                Route: {
                                    include: {
                                        DepartureAirport: {
                                            include: {
                                                City: true,
                                            },
                                        },
                                        ArrivalAirport: {
                                            include: {
                                                City: true,
                                            },
                                        },
                                    },
                                },
                                Airplane: {
                                    include: {
                                        Airline: true
                                    }
                                },
                                DepartureTerminal: true,
                                ArrivalTerminal: true
                            }
                        },
                        Route: {
                            include: {
                                DepartureAirport: {
                                    include: {
                                        City: true
                                    }
                                },
                                ArrivalAirport: {
                                    include: {
                                        City: true
                                    }
                                }
                            }   
                        },
                        Discount: true
                    }
                },
                ReturnTicket: {
                    include: {
                        Flights: {
                            include: {
                                Route: {
                                    include: {
                                        DepartureAirport: {
                                            include: {
                                                City: true,
                                            },
                                        },
                                        ArrivalAirport: {
                                            include: {
                                                City: true,
                                            },
                                        },
                                    },
                                },
                                Airplane: {
                                    include: {
                                        Airline: true
                                    }
                                },
                                DepartureTerminal: true,
                                ArrivalTerminal: true
                            }
                        },
                        Route: {
                            include: {
                                DepartureAirport: {
                                    include: {
                                        City: true
                                    }
                                },
                                ArrivalAirport: {
                                    include: {
                                        City: true
                                    }
                                }
                            }   
                        },
                        Discount: true
                    }
                }
            },
            orderBy: {
                bookingDate: 'desc'
            }
        });

        const formattedOrders = orders.map((order) => {
            const passengersMap = new Map();

            order.Passengers.forEach((passenger) => {
                const passengerId = passenger.identifierNumber;
                const seatInfo = {
                    id: passenger.Seat.id,
                    number: passenger.Seat.seatNumber,
                    class: passenger.Seat.Flight.seatClass,
                    airplane: passenger.Seat.Flight.Airplane.name,
                    airline: passenger.Seat.Flight.Airplane.Airline.name
                };
            
                if (passengersMap.has(passengerId)) {
                    passengersMap.get(passengerId).seat.push(seatInfo);
                } else {
                    passengersMap.set(passengerId, {
                        type: passenger.type,
                        title: passenger.title,
                        name: passenger.name,
                        familyName: passenger.familyName,
                        dateOfBirth: passenger.dateOfBirth,
                        nationality: passenger.nationality,
                        identifierNumber: passenger.identifierNumber,
                        issuedCountry: passenger.issuedCountry,
                        idValidUntil: passenger.idValidUntil,
                        seat: [seatInfo]
                    });
                }
            });

        return {
            id: order.id,
            orderStatus: order.orderStatus,
            isRoundTrip: order.isRoundTrip,
            bookingDate: order.bookingDate,
            qrCodeUrl: order.qrCodeUrl,
            pdfUrl: order.pdfUrl,
            detailPrice: order.detailPrice,
            payment: {
                id: order.Payment.id,
                method: order.Payment.method,
                amount: order.Payment.amount,
                fraudStatus: order.Payment.fraudStatus,
                validUntil: order.Payment.validUntil,
                paymentDate: order.Payment.paymentDate,
                token: order.Payment.token
            },
            passengers: Array.from(passengersMap.values()),
            outboundTicket: {
                id: order.OutboundTicket.id,
                class: order.OutboundTicket.class,
                isTransits: order.OutboundTicket.isTransits,
                price: order.OutboundTicket.price,
                totalPrice: order.OutboundTicket.totalPrice,
                totalDuration: order.OutboundTicket.totalDuration,
                discount: order.OutboundTicket.Discount,
                isActive: order.OutboundTicket.isActive,
                departure: {
                    time: order.OutboundTicket.departureTime,
                    airport: {
                        name: order.OutboundTicket.Route.DepartureAirport.name,
                        code: order.OutboundTicket.Route.DepartureAirport.iataCode,
                        type: order.OutboundTicket.Route.DepartureAirport.type,
                    },
                    city: {
                        name: order.OutboundTicket.Route.DepartureAirport.City.name,
                        code: order.OutboundTicket.Route.DepartureAirport.City.code,
                        image: order.OutboundTicket.Route.DepartureAirport.City.imageUrl,
                    },
                    country: {
                        name: order.OutboundTicket.Route.DepartureAirport.City.country,
                        code: order.OutboundTicket.Route.DepartureAirport.City.countryCode,
                    },
                },
                arrival: {
                    time: order.OutboundTicket.arrivalTime,
                    airport: {
                        name: order.OutboundTicket.Route.ArrivalAirport.name,
                        code: order.OutboundTicket.Route.ArrivalAirport.iataCode,
                        type: order.OutboundTicket.Route.ArrivalAirport.type,
                    },
                    city: {
                        name: order.OutboundTicket.Route.ArrivalAirport.City.name,
                        code: order.OutboundTicket.Route.ArrivalAirport.City.code,
                        image: order.OutboundTicket.Route.ArrivalAirport.City.imageUrl,
                    },
                    country: {
                        name: order.OutboundTicket.Route.ArrivalAirport.City.country,
                        code: order.OutboundTicket.Route.ArrivalAirport.City.countryCode,
                    },
                    continent: order.OutboundTicket.Route.ArrivalAirport.City.continent,
                },
                flights: order.OutboundTicket.Flights.map((flight) => {
                    return {
                        id: flight.id,
                        duration: flight.duration,
                        baggage: flight.baggage,
                        cabinBaggage: flight.cabinBaggage,
                        entertainment: flight.entertainment,
                        airline: {
                            name: flight.Airplane.Airline.name,
                            logo: flight.Airplane.Airline.imageUrl,
                        },
                        airplane: flight.Airplane.name,
                        departure: {
                            time: flight.departureTime,
                            airport: {
                                name: flight.Route.DepartureAirport.name,
                                code: flight.Route.DepartureAirport.iataCode,
                                type: flight.Route.DepartureAirport.type,
                            },
                            city: {
                                name: flight.Route.DepartureAirport.City.name,
                                code: flight.Route.DepartureAirport.City.code,
                                image: flight.Route.DepartureAirport.City.imageUrl,
                            },
                            country: {
                                name: flight.Route.DepartureAirport.City.country,
                                code: flight.Route.DepartureAirport.City.countryCode,
                            },
                            terminal: flight.DepartureTerminal
                                ? {
                                    name: flight.DepartureTerminal.name,
                                    type: flight.DepartureTerminal.type,
                                }
                                : null,
                        },
                        arrival: {
                            time: flight.arrivalTime,
                            airport: {
                                name: flight.Route.ArrivalAirport.name,
                                code: flight.Route.ArrivalAirport.iataCode,
                                type: flight.Route.ArrivalAirport.type,
                            },
                            city: {
                                name: flight.Route.ArrivalAirport.City.name,
                                code: flight.Route.ArrivalAirport.City.code,
                                image: flight.Route.ArrivalAirport.City.imageUrl,
                            },
                            country: {
                                name: flight.Route.ArrivalAirport.City.country,
                                code: flight.Route.ArrivalAirport.City.countryCode,
                            },
                            continent: flight.Route.ArrivalAirport.City.continent,
                            terminal: flight.ArrivalTerminal
                                ? {
                                    name: flight.ArrivalTerminal.name,
                                    type: flight.ArrivalTerminal.type,
                                }
                                : null,
                        },
                    };
                })
            },
            returnTicket: order.ReturnTicket ? {
                id: order.ReturnTicket.id,
                class: order.ReturnTicket.class,
                isTransits: order.ReturnTicket.isTransits,
                price: order.ReturnTicket.price,
                totalPrice: order.ReturnTicket.totalPrice,
                totalDuration: order.ReturnTicket.totalDuration,
                discount: order.ReturnTicket.Discount,
                isActive: order.ReturnTicket.isActive,
                departure: {
                    time: order.ReturnTicket.departureTime,
                    airport: {
                        name: order.ReturnTicket.Route.DepartureAirport.name,
                        code: order.ReturnTicket.Route.DepartureAirport.iataCode,
                        type: order.ReturnTicket.Route.DepartureAirport.type,
                    },
                    city: {
                        name: order.ReturnTicket.Route.DepartureAirport.City.name,
                        code: order.ReturnTicket.Route.DepartureAirport.City.code,
                        image: order.ReturnTicket.Route.DepartureAirport.City.imageUrl,
                    },
                    country: {
                        name: order.ReturnTicket.Route.DepartureAirport.City.country,
                        code: order.ReturnTicket.Route.DepartureAirport.City.countryCode,
                    },
                },
                arrival: {
                    time: order.ReturnTicket.arrivalTime,
                    airport: {
                        name: order.ReturnTicket.Route.ArrivalAirport.name,
                        code: order.ReturnTicket.Route.ArrivalAirport.iataCode,
                        type: order.ReturnTicket.Route.ArrivalAirport.type,
                    },
                    city: {
                        name: order.ReturnTicket.Route.ArrivalAirport.City.name,
                        code: order.ReturnTicket.Route.ArrivalAirport.City.code,
                        image: order.ReturnTicket.Route.ArrivalAirport.City.imageUrl,
                    },
                    country: {
                        name: order.ReturnTicket.Route.ArrivalAirport.City.country,
                        code: order.ReturnTicket.Route.ArrivalAirport.City.countryCode,
                    },
                    continent: order.ReturnTicket.Route.ArrivalAirport.City.continent,
                },
                flights: order.ReturnTicket.Flights.map((flight) => {
                    return {
                        id: flight.id,
                        duration: flight.duration,
                        baggage: flight.baggage,
                        cabinBaggage: flight.cabinBaggage,
                        entertainment: flight.entertainment,
                        airline: {
                            name: flight.Airplane.Airline.name,
                            logo: flight.Airplane.Airline.imageUrl,
                        },
                        airplane: flight.Airplane.name,
                        departure: {
                            time: flight.departureTime,
                            airport: {
                                name: flight.Route.DepartureAirport.name,
                                code: flight.Route.DepartureAirport.iataCode,
                                type: flight.Route.DepartureAirport.type,
                            },
                            city: {
                                name: flight.Route.DepartureAirport.City.name,
                                code: flight.Route.DepartureAirport.City.code,
                                image: flight.Route.DepartureAirport.City.imageUrl,
                            },
                            country: {
                                name: flight.Route.DepartureAirport.City.country,
                                code: flight.Route.DepartureAirport.City.countryCode,
                            },
                            terminal: flight.DepartureTerminal
                                ? {
                                    name: flight.DepartureTerminal.name,
                                    type: flight.DepartureTerminal.type,
                                }
                                : null,
                        },
                        arrival: {
                            time: flight.arrivalTime,
                            airport: {
                                name: flight.Route.ArrivalAirport.name,
                                code: flight.Route.ArrivalAirport.iataCode,
                                type: flight.Route.ArrivalAirport.type,
                            },
                            city: {
                                name: flight.Route.ArrivalAirport.City.name,
                                code: flight.Route.ArrivalAirport.City.code,
                                image: flight.Route.ArrivalAirport.City.imageUrl,
                            },
                            country: {
                                name: flight.Route.ArrivalAirport.City.country,
                                code: flight.Route.ArrivalAirport.City.countryCode,
                            },
                            continent: flight.Route.ArrivalAirport.City.continent,
                            terminal: flight.ArrivalTerminal
                                ? {
                                    name: flight.ArrivalTerminal.name,
                                    type: flight.ArrivalTerminal.type,
                                }
                                : null,
                        },
                    };
                })
            } : null,
        };
    });

    const totalOrders = formattedOrders.length;

    return {
        formattedOrders,
        totalOrders
    };

    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}

export const getUserOwnedOrderById = async (id, userId) => {
    try {
        const order = await prisma.order.findUnique({
            where: {
                id,
                userId
            },
            include: {
                Payment: true,
                Passengers: {
                    include: {
                        Seat: {
                            include: {
                                Flight: {
                                    include: {
                                        Route: true,
                                        Airplane: {
                                            include: {
                                                Airline: true
                                            }
                                        },
                                        DepartureTerminal: true,
                                        ArrivalTerminal: true
                                    }
                                }
                            }
                        }
                    }
                },
                OutboundTicket: {
                    include: {
                        Flights: {
                            include: {
                                Route: {
                                    include: {
                                        DepartureAirport: {
                                            include: {
                                                City: true,
                                            },
                                        },
                                        ArrivalAirport: {
                                            include: {
                                                City: true,
                                            },
                                        },
                                    },
                                },
                                Airplane: {
                                    include: {
                                        Airline: true
                                    }
                                },
                                DepartureTerminal: true,
                                ArrivalTerminal: true,
                                Seat: {
                                    orderBy: {
                                        seatNumber: 'asc'
                                    }
                                }
                            }
                        },
                        Route: {
                            include: {
                                DepartureAirport: {
                                    include: {
                                        City: true
                                    }
                                },
                                ArrivalAirport: {
                                    include: {
                                        City: true
                                    }
                                }
                            }   
                        },
                        Discount: true
                    }
                },
                ReturnTicket: {
                    include: {
                        Flights: {
                            include: {
                                Route: {
                                    include: {
                                        DepartureAirport: {
                                            include: {
                                                City: true,
                                            },
                                        },
                                        ArrivalAirport: {
                                            include: {
                                                City: true,
                                            },
                                        },
                                    },
                                },
                                Airplane: {
                                    include: {
                                        Airline: true
                                    }
                                },
                                DepartureTerminal: true,
                                ArrivalTerminal: true,
                                Seat: {
                                    orderBy: {
                                        seatNumber: 'asc'
                                    }
                                }
                            }
                        },
                        Route: {
                            include: {
                                DepartureAirport: {
                                    include: {
                                        City: true
                                    }
                                },
                                ArrivalAirport: {
                                    include: {
                                        City: true
                                    }
                                }
                            }   
                        },
                        Discount: true
                    }
                }
            }
        });

        if (!order) {
            return null;
        }

        const passengersMap = new Map();

        order.Passengers.forEach((passenger) => {
            const passengerId = passenger.identifierNumber;
            const seatInfo = {
                id: passenger.Seat.id,
                number: passenger.Seat.seatNumber,
                flightId: passenger.Seat.flightId,
                class: passenger.Seat.Flight.seatClass,
                airplane: passenger.Seat.Flight.Airplane.name,
                airline: passenger.Seat.Flight.Airplane.Airline.name
            };
        
            if (passengersMap.has(passengerId)) {
                passengersMap.get(passengerId).seat.push(seatInfo);
            } else {
                passengersMap.set(passengerId, {
                    type: passenger.type,
                    title: passenger.title,
                    name: passenger.name,
                    familyName: passenger.familyName,
                    dateOfBirth: passenger.dateOfBirth,
                    nationality: passenger.nationality,
                    identifierNumber: passenger.identifierNumber,
                    issuedCountry: passenger.issuedCountry,
                    idValidUntil: passenger.idValidUntil,
                    seat: [seatInfo]
                });
            }
        });
        
        const formattedOrder = {
            id: order.id,
            orderStatus: order.orderStatus,
            isRoundTrip: order.isRoundTrip,
            bookingDate: order.bookingDate,
            qrCodeUrl: order.qrCodeUrl,
            pdfUrl: order.pdfUrl,
            detailPrice: order.detailPrice,
            payment: {
                id: order.Payment.id,
                method: order.Payment.method,
                amount: order.Payment.amount,
                fraudStatus: order.Payment.fraudStatus,
                validUntil: order.Payment.validUntil,
                paymentDate: order.Payment.paymentDate,
                token: order.Payment.token
            },
            passengers: Array.from(passengersMap.values()),
            outboundTicket: {
                id: order.OutboundTicket.id,
                class: order.OutboundTicket.class,
                isTransits: order.OutboundTicket.isTransits,
                price: order.OutboundTicket.price,
                totalPrice: order.OutboundTicket.totalPrice,
                totalDuration: order.OutboundTicket.totalDuration,
                discount: order.OutboundTicket.Discount,
                isActive: order.OutboundTicket.isActive,
                departure: {
                    time: order.OutboundTicket.departureTime,
                    airport: {
                        name: order.OutboundTicket.Route.DepartureAirport.name,
                        code: order.OutboundTicket.Route.DepartureAirport.iataCode,
                        type: order.OutboundTicket.Route.DepartureAirport.type,
                    },
                    city: {
                        name: order.OutboundTicket.Route.DepartureAirport.City.name,
                        code: order.OutboundTicket.Route.DepartureAirport.City.code,
                        image: order.OutboundTicket.Route.DepartureAirport.City.imageUrl,
                    },
                    country: {
                        name: order.OutboundTicket.Route.DepartureAirport.City.country,
                        code: order.OutboundTicket.Route.DepartureAirport.City.countryCode,
                    },
                },
                arrival: {
                    time: order.OutboundTicket.arrivalTime,
                    airport: {
                        name: order.OutboundTicket.Route.ArrivalAirport.name,
                        code: order.OutboundTicket.Route.ArrivalAirport.iataCode,
                        type: order.OutboundTicket.Route.ArrivalAirport.type,
                    },
                    city: {
                        name: order.OutboundTicket.Route.ArrivalAirport.City.name,
                        code: order.OutboundTicket.Route.ArrivalAirport.City.code,
                        image: order.OutboundTicket.Route.ArrivalAirport.City.imageUrl,
                    },
                    country: {
                        name: order.OutboundTicket.Route.ArrivalAirport.City.country,
                        code: order.OutboundTicket.Route.ArrivalAirport.City.countryCode,
                    },
                    continent: order.OutboundTicket.Route.ArrivalAirport.City.continent,
                },
                flights: order.OutboundTicket.Flights.map((flight) => {
                    return {
                        id: flight.id,
                        duration: flight.duration,
                        baggage: flight.baggage,
                        cabinBaggage: flight.cabinBaggage,
                        entertainment: flight.entertainment,
                        airline: {
                            name: flight.Airplane.Airline.name,
                            logo: flight.Airplane.Airline.imageUrl,
                        },
                        airplane: flight.Airplane.name,
                        departure: {
                            time: flight.departureTime,
                            airport: {
                                name: flight.Route.DepartureAirport.name,
                                code: flight.Route.DepartureAirport.iataCode,
                                type: flight.Route.DepartureAirport.type,
                            },
                            city: {
                                name: flight.Route.DepartureAirport.City.name,
                                code: flight.Route.DepartureAirport.City.code,
                                image: flight.Route.DepartureAirport.City.imageUrl,
                            },
                            country: {
                                name: flight.Route.DepartureAirport.City.country,
                                code: flight.Route.DepartureAirport.City.countryCode,
                            },
                            terminal: flight.DepartureTerminal
                                ? {
                                    name: flight.DepartureTerminal.name,
                                    type: flight.DepartureTerminal.type,
                                }
                                : null,
                        },
                        arrival: {
                            time: flight.arrivalTime,
                            airport: {
                                name: flight.Route.ArrivalAirport.name,
                                code: flight.Route.ArrivalAirport.iataCode,
                                type: flight.Route.ArrivalAirport.type,
                            },
                            city: {
                                name: flight.Route.ArrivalAirport.City.name,
                                code: flight.Route.ArrivalAirport.City.code,
                                image: flight.Route.ArrivalAirport.City.imageUrl,
                            },
                            country: {
                                name: flight.Route.ArrivalAirport.City.country,
                                code: flight.Route.ArrivalAirport.City.countryCode,
                            },
                            continent: flight.Route.ArrivalAirport.City.continent,
                            terminal: flight.ArrivalTerminal
                                ? {
                                    name: flight.ArrivalTerminal.name,
                                    type: flight.ArrivalTerminal.type,
                                }
                                : null,
                        },
                        seat: flight.Seat
                    };
                })
            },
            returnTicket: order.ReturnTicket ? {
                id: order.ReturnTicket.id,
                class: order.ReturnTicket.class,
                isTransits: order.ReturnTicket.isTransits,
                price: order.ReturnTicket.price,
                totalPrice: order.ReturnTicket.totalPrice,
                totalDuration: order.ReturnTicket.totalDuration,
                discount: order.ReturnTicket.Discount,
                isActive: order.ReturnTicket.isActive,
                departure: {
                    time: order.ReturnTicket.departureTime,
                    airport: {
                        name: order.ReturnTicket.Route.DepartureAirport.name,
                        code: order.ReturnTicket.Route.DepartureAirport.iataCode,
                        type: order.ReturnTicket.Route.DepartureAirport.type,
                    },
                    city: {
                        name: order.ReturnTicket.Route.DepartureAirport.City.name,
                        code: order.ReturnTicket.Route.DepartureAirport.City.code,
                        image: order.ReturnTicket.Route.DepartureAirport.City.imageUrl,
                    },
                    country: {
                        name: order.ReturnTicket.Route.DepartureAirport.City.country,
                        code: order.ReturnTicket.Route.DepartureAirport.City.countryCode,
                    },
                },
                arrival: {
                    time: order.ReturnTicket.arrivalTime,
                    airport: {
                        name: order.ReturnTicket.Route.ArrivalAirport.name,
                        code: order.ReturnTicket.Route.ArrivalAirport.iataCode,
                        type: order.ReturnTicket.Route.ArrivalAirport.type,
                    },
                    city: {
                        name: order.ReturnTicket.Route.ArrivalAirport.City.name,
                        code: order.ReturnTicket.Route.ArrivalAirport.City.code,
                        image: order.ReturnTicket.Route.ArrivalAirport.City.imageUrl,
                    },
                    country: {
                        name: order.ReturnTicket.Route.ArrivalAirport.City.country,
                        code: order.ReturnTicket.Route.ArrivalAirport.City.countryCode,
                    },
                    continent: order.ReturnTicket.Route.ArrivalAirport.City.continent,
                },
                flights: order.ReturnTicket.Flights.map((flight) => {
                    return {
                        id: flight.id,
                        duration: flight.duration,
                        baggage: flight.baggage,
                        cabinBaggage: flight.cabinBaggage,
                        entertainment: flight.entertainment,
                        airline: {
                            name: flight.Airplane.Airline.name,
                            logo: flight.Airplane.Airline.imageUrl,
                        },
                        airplane: flight.Airplane.name,
                        departure: {
                            time: flight.departureTime,
                            airport: {
                                name: flight.Route.DepartureAirport.name,
                                code: flight.Route.DepartureAirport.iataCode,
                                type: flight.Route.DepartureAirport.type,
                            },
                            city: {
                                name: flight.Route.DepartureAirport.City.name,
                                code: flight.Route.DepartureAirport.City.code,
                                image: flight.Route.DepartureAirport.City.imageUrl,
                            },
                            country: {
                                name: flight.Route.DepartureAirport.City.country,
                                code: flight.Route.DepartureAirport.City.countryCode,
                            },
                            terminal: flight.DepartureTerminal
                                ? {
                                    name: flight.DepartureTerminal.name,
                                    type: flight.DepartureTerminal.type,
                                }
                                : null,
                        },
                        arrival: {
                            time: flight.arrivalTime,
                            airport: {
                                name: flight.Route.ArrivalAirport.name,
                                code: flight.Route.ArrivalAirport.iataCode,
                                type: flight.Route.ArrivalAirport.type,
                            },
                            city: {
                                name: flight.Route.ArrivalAirport.City.name,
                                code: flight.Route.ArrivalAirport.City.code,
                                image: flight.Route.ArrivalAirport.City.imageUrl,
                            },
                            country: {
                                name: flight.Route.ArrivalAirport.City.country,
                                code: flight.Route.ArrivalAirport.City.countryCode,
                            },
                            continent: flight.Route.ArrivalAirport.City.continent,
                            terminal: flight.ArrivalTerminal
                                ? {
                                    name: flight.ArrivalTerminal.name,
                                    type: flight.ArrivalTerminal.type,
                                }
                                : null,
                        },
                        seat: flight.Seat
                    };
                })
            } : null,
        };
        
        return formattedOrder;
        
    } catch (error) {
        console.error('Error fetching ticket:', error);
        throw error;
    }
}

export const createOrder = async (request, paymentId, orderId, userId) => { 
    try {
        const returnTicketId = (request.returnTicketId) ? request.returnTicketId : null;
        const isRoundTrip = (request.returnTicketId) ? true : false;
        const nowUTC = new Date(Date.now()); // Get the current date and time in UTC
        const nowUTCPlus7 = add(nowUTC, { hours: 7 }); // Add 7 hours to the current UTC time
        const bookingDate = nowUTCPlus7.toISOString();

        return prisma.order.create({
            data: {
                id: orderId,
                userId,
                paymentId,
                isRoundTrip,
                bookingDate,
                detailPrice: request.detailPrice,
                outboundTicketId: request.outboundTicketId,
                returnTicketId
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

export const updateOrderStatusByPaymentId = async (paymentId, paymentStatus) => {
    try {
        let orderStatus;
        switch (paymentStatus) {
            case 'settlement':
            case 'capture':
                orderStatus = 'Issued';
                break;
            case 'pending':
                orderStatus = 'Unpaid';
                break;
            case 'cancel':
            case 'deny':
                orderStatus = 'Cancelled';
                break;
            case 'expire':
                orderStatus = 'Expired';
                break;
            default:
                orderStatus = 'Unknown';
                break;
        }

        return prisma.order.update({
            where: {
                paymentId
            },
            data: {
                orderStatus
            },
            include: {
                User: true,
            }
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

export const cancelOrderById = async (id) => {
    try {
        return prisma.order.update({
            where: {
                id
            },
            data: {
                orderStatus: 'Cancelled'
            }
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }
}

// admin only
export const getAllOrders = async () => {
        try {
            const orders = await prisma.order.findMany({
                include: {
                    Payment: true,
                    Passengers: {
                        include: {
                            Seat: {
                                include: {
                                    Flight: {
                                        include: {
                                            Route: true,
                                            Airplane: {
                                                include: {
                                                    Airline: true
                                                }
                                            },
                                            DepartureTerminal: true,
                                            ArrivalTerminal: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    OutboundTicket: {
                        include: {
                            Flights: {
                                include: {
                                    Route: {
                                        include: {
                                            DepartureAirport: {
                                                include: {
                                                    City: true,
                                                },
                                            },
                                            ArrivalAirport: {
                                                include: {
                                                    City: true,
                                                },
                                            },
                                        },
                                    },
                                    Airplane: {
                                        include: {
                                            Airline: true
                                        }
                                    },
                                    DepartureTerminal: true,
                                    ArrivalTerminal: true
                                }
                            },
                            Route: {
                                include: {
                                    DepartureAirport: {
                                        include: {
                                            City: true
                                        }
                                    },
                                    ArrivalAirport: {
                                        include: {
                                            City: true
                                        }
                                    }
                                }   
                            },
                            Discount: true
                        }
                    },
                    ReturnTicket: {
                        include: {
                            Flights: {
                                include: {
                                    Route: {
                                        include: {
                                            DepartureAirport: {
                                                include: {
                                                    City: true,
                                                },
                                            },
                                            ArrivalAirport: {
                                                include: {
                                                    City: true,
                                                },
                                            },
                                        },
                                    },
                                    Airplane: {
                                        include: {
                                            Airline: true
                                        }
                                    },
                                    DepartureTerminal: true,
                                    ArrivalTerminal: true
                                }
                            },
                            Route: {
                                include: {
                                    DepartureAirport: {
                                        include: {
                                            City: true
                                        }
                                    },
                                    ArrivalAirport: {
                                        include: {
                                            City: true
                                        }
                                    }
                                }   
                            },
                            Discount: true
                        }
                    },
                    User: {
                        include: {
                            Account: true
                        }
                    }
                },
                orderBy: {
                    bookingDate: 'desc'
                }
            });

            const formattedOrders = orders.map((order) => {
                const passengersMap = new Map();

                order.Passengers.forEach((passenger) => {
                    const passengerId = passenger.identifierNumber;
                    const seatInfo = {
                        id: passenger.Seat.id,
                        number: passenger.Seat.seatNumber,
                        class: passenger.Seat.Flight.seatClass,
                        airplane: passenger.Seat.Flight.Airplane.name,
                        airline: passenger.Seat.Flight.Airplane.Airline.name
                    };
                
                    if (passengersMap.has(passengerId)) {
                        passengersMap.get(passengerId).seat.push(seatInfo);
                    } else {
                        passengersMap.set(passengerId, {
                            type: passenger.type,
                            title: passenger.title,
                            name: passenger.name,
                            familyName: passenger.familyName,
                            dateOfBirth: passenger.dateOfBirth,
                            nationality: passenger.nationality,
                            identifierNumber: passenger.identifierNumber,
                            issuedCountry: passenger.issuedCountry,
                            idValidUntil: passenger.idValidUntil,
                            seat: [seatInfo]
                        });
                    }
                });

            return {
                id: order.id,
                orderStatus: order.orderStatus,
                isRoundTrip: order.isRoundTrip,
                bookingDate: order.bookingDate,
                qrCodeUrl: order.qrCodeUrl,
                pdfUrl: order.pdfUrl,
                detailPrice: order.detailPrice,
                payment: {
                    id: order.Payment.id,
                    method: order.Payment.method,
                    amount: order.Payment.amount,
                    fraudStatus: order.Payment.fraudStatus,
                    validUntil: order.Payment.validUntil,
                    paymentDate: order.Payment.paymentDate,
                    token: order.Payment.token
                },
                passengers: Array.from(passengersMap.values()),
                outboundTicket: {
                    id: order.OutboundTicket.id,
                    class: order.OutboundTicket.class,
                    isTransits: order.OutboundTicket.isTransits,
                    price: order.OutboundTicket.price,
                    totalPrice: order.OutboundTicket.totalPrice,
                    totalDuration: order.OutboundTicket.totalDuration,
                    discount: order.OutboundTicket.Discount,
                    isActive: order.OutboundTicket.isActive,
                    departure: {
                        time: order.OutboundTicket.departureTime,
                        airport: {
                            name: order.OutboundTicket.Route.DepartureAirport.name,
                            code: order.OutboundTicket.Route.DepartureAirport.iataCode,
                            type: order.OutboundTicket.Route.DepartureAirport.type,
                        },
                        city: {
                            name: order.OutboundTicket.Route.DepartureAirport.City.name,
                            code: order.OutboundTicket.Route.DepartureAirport.City.code,
                            image: order.OutboundTicket.Route.DepartureAirport.City.imageUrl,
                        },
                        country: {
                            name: order.OutboundTicket.Route.DepartureAirport.City.country,
                            code: order.OutboundTicket.Route.DepartureAirport.City.countryCode,
                        },
                    },
                    arrival: {
                        time: order.OutboundTicket.arrivalTime,
                        airport: {
                            name: order.OutboundTicket.Route.ArrivalAirport.name,
                            code: order.OutboundTicket.Route.ArrivalAirport.iataCode,
                            type: order.OutboundTicket.Route.ArrivalAirport.type,
                        },
                        city: {
                            name: order.OutboundTicket.Route.ArrivalAirport.City.name,
                            code: order.OutboundTicket.Route.ArrivalAirport.City.code,
                            image: order.OutboundTicket.Route.ArrivalAirport.City.imageUrl,
                        },
                        country: {
                            name: order.OutboundTicket.Route.ArrivalAirport.City.country,
                            code: order.OutboundTicket.Route.ArrivalAirport.City.countryCode,
                        },
                        continent: order.OutboundTicket.Route.ArrivalAirport.City.continent,
                    },
                    flights: order.OutboundTicket.Flights.map((flight) => {
                        return {
                            id: flight.id,
                            duration: flight.duration,
                            baggage: flight.baggage,
                            cabinBaggage: flight.cabinBaggage,
                            entertainment: flight.entertainment,
                            airline: {
                                name: flight.Airplane.Airline.name,
                                logo: flight.Airplane.Airline.imageUrl,
                            },
                            airplane: flight.Airplane.name,
                            departure: {
                                time: flight.departureTime,
                                airport: {
                                    name: flight.Route.DepartureAirport.name,
                                    code: flight.Route.DepartureAirport.iataCode,
                                    type: flight.Route.DepartureAirport.type,
                                },
                                city: {
                                    name: flight.Route.DepartureAirport.City.name,
                                    code: flight.Route.DepartureAirport.City.code,
                                    image: flight.Route.DepartureAirport.City.imageUrl,
                                },
                                country: {
                                    name: flight.Route.DepartureAirport.City.country,
                                    code: flight.Route.DepartureAirport.City.countryCode,
                                },
                                terminal: flight.DepartureTerminal
                                    ? {
                                        name: flight.DepartureTerminal.name,
                                        type: flight.DepartureTerminal.type,
                                    }
                                    : null,
                            },
                            arrival: {
                                time: flight.arrivalTime,
                                airport: {
                                    name: flight.Route.ArrivalAirport.name,
                                    code: flight.Route.ArrivalAirport.iataCode,
                                    type: flight.Route.ArrivalAirport.type,
                                },
                                city: {
                                    name: flight.Route.ArrivalAirport.City.name,
                                    code: flight.Route.ArrivalAirport.City.code,
                                    image: flight.Route.ArrivalAirport.City.imageUrl,
                                },
                                country: {
                                    name: flight.Route.ArrivalAirport.City.country,
                                    code: flight.Route.ArrivalAirport.City.countryCode,
                                },
                                continent: flight.Route.ArrivalAirport.City.continent,
                                terminal: flight.ArrivalTerminal
                                    ? {
                                        name: flight.ArrivalTerminal.name,
                                        type: flight.ArrivalTerminal.type,
                                    }
                                    : null,
                            },
                        };
                    })
                },
                returnTicket: order.ReturnTicket ? {
                    id: order.ReturnTicket.id,
                    class: order.ReturnTicket.class,
                    isTransits: order.ReturnTicket.isTransits,
                    price: order.ReturnTicket.price,
                    totalPrice: order.ReturnTicket.totalPrice,
                    totalDuration: order.ReturnTicket.totalDuration,
                    discount: order.ReturnTicket.Discount,
                    isActive: order.ReturnTicket.isActive,
                    departure: {
                        time: order.ReturnTicket.departureTime,
                        airport: {
                            name: order.ReturnTicket.Route.DepartureAirport.name,
                            code: order.ReturnTicket.Route.DepartureAirport.iataCode,
                            type: order.ReturnTicket.Route.DepartureAirport.type,
                        },
                        city: {
                            name: order.ReturnTicket.Route.DepartureAirport.City.name,
                            code: order.ReturnTicket.Route.DepartureAirport.City.code,
                            image: order.ReturnTicket.Route.DepartureAirport.City.imageUrl,
                        },
                        country: {
                            name: order.ReturnTicket.Route.DepartureAirport.City.country,
                            code: order.ReturnTicket.Route.DepartureAirport.City.countryCode,
                        },
                    },
                    arrival: {
                        time: order.ReturnTicket.arrivalTime,
                        airport: {
                            name: order.ReturnTicket.Route.ArrivalAirport.name,
                            code: order.ReturnTicket.Route.ArrivalAirport.iataCode,
                            type: order.ReturnTicket.Route.ArrivalAirport.type,
                        },
                        city: {
                            name: order.ReturnTicket.Route.ArrivalAirport.City.name,
                            code: order.ReturnTicket.Route.ArrivalAirport.City.code,
                            image: order.ReturnTicket.Route.ArrivalAirport.City.imageUrl,
                        },
                        country: {
                            name: order.ReturnTicket.Route.ArrivalAirport.City.country,
                            code: order.ReturnTicket.Route.ArrivalAirport.City.countryCode,
                        },
                        continent: order.ReturnTicket.Route.ArrivalAirport.City.continent,
                    },
                    flights: order.ReturnTicket.Flights.map((flight) => {
                        return {
                            id: flight.id,
                            duration: flight.duration,
                            baggage: flight.baggage,
                            cabinBaggage: flight.cabinBaggage,
                            entertainment: flight.entertainment,
                            airline: {
                                name: flight.Airplane.Airline.name,
                                logo: flight.Airplane.Airline.imageUrl,
                            },
                            airplane: flight.Airplane.name,
                            departure: {
                                time: flight.departureTime,
                                airport: {
                                    name: flight.Route.DepartureAirport.name,
                                    code: flight.Route.DepartureAirport.iataCode,
                                    type: flight.Route.DepartureAirport.type,
                                },
                                city: {
                                    name: flight.Route.DepartureAirport.City.name,
                                    code: flight.Route.DepartureAirport.City.code,
                                    image: flight.Route.DepartureAirport.City.imageUrl,
                                },
                                country: {
                                    name: flight.Route.DepartureAirport.City.country,
                                    code: flight.Route.DepartureAirport.City.countryCode,
                                },
                                terminal: flight.DepartureTerminal
                                    ? {
                                        name: flight.DepartureTerminal.name,
                                        type: flight.DepartureTerminal.type,
                                    }
                                    : null,
                            },
                            arrival: {
                                time: flight.arrivalTime,
                                airport: {
                                    name: flight.Route.ArrivalAirport.name,
                                    code: flight.Route.ArrivalAirport.iataCode,
                                    type: flight.Route.ArrivalAirport.type,
                                },
                                city: {
                                    name: flight.Route.ArrivalAirport.City.name,
                                    code: flight.Route.ArrivalAirport.City.code,
                                    image: flight.Route.ArrivalAirport.City.imageUrl,
                                },
                                country: {
                                    name: flight.Route.ArrivalAirport.City.country,
                                    code: flight.Route.ArrivalAirport.City.countryCode,
                                },
                                continent: flight.Route.ArrivalAirport.City.continent,
                                terminal: flight.ArrivalTerminal
                                    ? {
                                        name: flight.ArrivalTerminal.name,
                                        type: flight.ArrivalTerminal.type,
                                    }
                                    : null,
                            },
                        };
                    })
                } : null,
                user: {
                    id: order.User.id,
                    fullName: order.User.fullName,
                    phoneNumber: order.User.phoneNumber,
                    email: order.User.Account.email
                }
            };
        });

        const totalOrders = formattedOrders.length;

        return {formattedOrders, totalOrders};

    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}

export const addQrCodeAndPdfUrlOrder = async (order) => {
    try {
        const qrCodeUrl = await createQrCodeUrlByOrderId(order.id);
        const pdfUrl = await createPdfUrlByOrderId(order, qrCodeUrl);
        await prisma.order.update({
            where: {
                id: order.id
            },
            data: {
                qrCodeUrl,
                pdfUrl
            }
        });

        return pdfUrl;
    } catch (error) {
        console.error('Error adding QR code and PDF URL:', error);
        throw error;
    }
}