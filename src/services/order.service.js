import prisma from '../utils/prisma.js';

export const getAllUserOwnedOrders = async (userId) => {
    try {
        return prisma.order.findMany({
            where: {
                userId
            },
            include: {
                OutboundTicket: {
                    include: {
                        Flights: {
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
                                Route: true,
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
                User: true
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}

export const getUserOwnedOrderById = async (id, userId) => {
    try {
        return prisma.order.findUnique({
            where: {
                id,
                userId
            },
            include: {
                OutboundTicket: {
                    include: {
                        Flights: {
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
                                Route: true,
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
                User: true
            }
        });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        throw error;
    }
}

export const createOrder = async (request, paymentId, userId) => { 
    try {
        const returnTicketId = (request.returnTicketId) ? request.returnTicketId : null;
        const isRoundTrip = (request.returnTicketId) ? true : false;

        return prisma.order.create({
            data: {
                userId,
                paymentId,
                isRoundTrip,
                qrCodeUrl: 'test',
                outboundTicketId: request.outboundTicketId,
                returnTicketId,
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

export const cancelOrderById = async (orderId) => {
    try {
        return prisma.order.update({
            where: {
                id: orderId
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