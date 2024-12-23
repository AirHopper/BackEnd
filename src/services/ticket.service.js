import prisma from "../utils/prisma.js";
import AppError from "../utils/AppError.js";
import dotenv from "dotenv";

dotenv.config();

// Helper function to convert date to string with UTC+7 timezone
function toDateStringMinus7Hours(dateInput) {
  const date = new Date(dateInput); // Ensure it's a Date object

  if (process.env.NODE_ENV === "development") {
    date.setHours(date.getHours() - 7); // Subtract 7 hours
  }

  return date.toDateString(); // Convert to a string
}

// Helper function to get the current date in UTC+7
function getUTC7Date() {
  const now = new Date();

  let utc7;

  if (process.env.NODE_ENV === "development") {
    const utc7Offset = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds
    utc7 = new Date(now.getTime() + utc7Offset);
  } else {
    utc7 = new Date(now.getTime());
  }

  return new Date(utc7);
}

// Helper function to get the current date in UTC+7 with time set to 00:00
function getUTC7DateStart() {
  const now = new Date();
  let utcMidnight;

  if (process.env.NODE_ENV === "development") {
    const utc7Offset = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds
    utcMidnight = new Date(now.getTime() + utc7Offset).setUTCHours(0, 0, 0, 0);
  } else {
    utcMidnight = new Date(now.getTime()).setUTCHours(0, 0, 0, 0);
  }

  return new Date(utcMidnight);
}

// Validate flights sequence and credibility
async function validateFlights({ routeId, flightIds }) {
  const route = await prisma.route.findUnique({
    where: { id: routeId },
    include: {
      DepartureAirport: true,
      ArrivalAirport: true,
    },
  });

  if (!route) {
    throw new AppError("Route not found", 404);
  }

  const flights = await prisma.flight.findMany({
    where: { id: { in: flightIds } },
    orderBy: { departureTime: "asc" }, // Ensure sequential order
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
    },
  });

  // Validate all flights exist
  if (flights.length !== flightIds.length) {
    throw new AppError("Some flights could not be found", 400);
  }

  const firstFlight = flights[0];
  const lastFlight = flights[flights.length - 1];

  // Ensure all flights are on the same day and class type
  const firstFlightDate = toDateStringMinus7Hours(flights[0].departureTime);
  const classType = firstFlight.class;

  for (const flight of flights) {
    const flightDate = toDateStringMinus7Hours(flight.departureTime);

    if (flightDate !== firstFlightDate) {
      throw new AppError("All flights must be on the same day", 400);
    }

    if (flight.class !== classType) {
      throw new AppError("All flights must be of the same class type", 400);
    }
  }

  // Validate first and last flights match the route's airports
  if (
    firstFlight.Route.DepartureAirport.id !== route.DepartureAirport.id ||
    lastFlight.Route.ArrivalAirport.id !== route.ArrivalAirport.id
  ) {
    throw new AppError(
      "First flight's departure or last flight's arrival does not match the route",
      400
    );
  }

  // Validate connecting airports and sequence
  for (let i = 0; i < flights.length - 1; i++) {
    const currentFlight = flights[i];
    const nextFlight = flights[i + 1];

    if (
      currentFlight.Route.ArrivalAirport.id !==
      nextFlight.Route.DepartureAirport.id
    ) {
      throw new AppError("Connecting flights do not match", 400);
    }

    if (currentFlight.arrivalTime > nextFlight.departureTime) {
      throw new AppError("Flights are not in sequential order by time", 400);
    }
  }

  return flights;
}

// Calculate total price of all flights
function calculatePrice(flights) {
  return flights.reduce((total, flight) => total + parseInt(flight.price), 0);
}

// Calculate total duration of all flights, including transit times
function calculateDuration(flights) {
  return flights.reduce((total, flight, index) => {
    if (index === 0) {
      return total + parseInt(flight.duration);
    }

    // Add transit time between current flight and the previous flight
    const previousFlight = flights[index - 1];
    const transitTime = calculateTransitTime(
      previousFlight.arrivalTime,
      flight.departureTime
    );

    return total + parseInt(flight.duration) + transitTime;
  }, 0);
}

// Helper function to calculate transit time in minutes
function calculateTransitTime(arrivalTime, departureTime) {
  const arrival = new Date(arrivalTime);
  const departure = new Date(departureTime);
  return Math.max(0, (departure - arrival) / (1000 * 60));
}

// TODO Get all tickets
export const getAll = async ({
  page = 1,
  limit = 10,
  search,
  orderBy = "price_asc",
}) => {
  try {
    const offset = (page - 1) * limit;

    let {
      departureCity,
      arrivalCity,
      flightDate,
      classType,
      continent,
      isTransit,
      airline,
    } = search || {};

    // Throw error if flightDate is before today in UTC+7
    if (flightDate && new Date(flightDate) < getUTC7DateStart()) {
      throw new AppError("Flight date must be today or later in UTC+7", 400);
    }

    // Parse departureCity and arrivalCity to replace '+'
    departureCity = departureCity ? departureCity.replace(/\+/g, " ") : "";
    arrivalCity = arrivalCity ? arrivalCity.replace(/\+/g, " ") : "";

    // Parse classType to replace ' ' or '+' with '_'
    classType = classType ? classType.replace(/[\s+]/g, "_") : "";

    const searchFilters = {
      AND: [
        ...(departureCity
          ? [
              {
                Route: {
                  DepartureAirport: {
                    City: {
                      name: {
                        contains: departureCity,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
            ]
          : []),
        ...(airline && Array.isArray(airline) && airline.length > 0
          ? [
              {
                Flights: {
                  some: {
                    Airplane: {
                      Airline: {
                        name: {
                          in: airline, // Use 'in' operator for array matching
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                },
              },
            ]
          : []),
        ...(arrivalCity
          ? [
              {
                Route: {
                  ArrivalAirport: {
                    City: {
                      name: { contains: arrivalCity, mode: "insensitive" },
                    },
                  },
                },
              },
            ]
          : []),
        ...(flightDate
          ? [
              {
                departureTime: {
                  gte: new Date(flightDate),
                  lt: new Date(
                    new Date(flightDate).setDate(
                      new Date(flightDate).getDate() + 1
                    )
                  ),
                },
              },
            ]
          : []),
        ...(classType
          ? [
              {
                class: classType,
              },
            ]
          : []),
        ...(continent
          ? [
              {
                Route: {
                  ArrivalAirport: {
                    City: {
                      continent: continent,
                    },
                  },
                },
              },
            ]
          : []),
        ...(isTransit
          ? [
              {
                isTransits: isTransit === "1" ? true : false,
              },
            ]
          : []),
        ...[
          {
            isActive: true,
          },
        ],
        ...[
          {
            departureTime: {
              gte: getUTC7Date(), // Filter for tickets with departure time before the current date
            },
          },
        ],
      ],
    };

    const prismaOrderBy = (() => {
      switch (orderBy) {
        case "price_asc":
          return { totalPrice: "asc" };
        case "duration_asc":
          return { totalDuration: "asc" };
        case "departure_soon":
          return { departureTime: "asc" };
        case "departure_late":
          return { departureTime: "desc" };
        case "arrival_soon":
          return { arrivalTime: "asc" };
        case "arrival_late":
          return { arrivalTime: "desc" };
        default:
          return { totalPrice: "asc" };
      }
    })();

    const tickets = await prisma.ticket.findMany({
      where: searchFilters,
      include: {
        Flights: {
          orderBy: {
            departureTime: "asc",
          },
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
                Airline: true,
              },
            },
            DepartureTerminal: true,
            ArrivalTerminal: true,
            Seat: {
              select: {
                isOccupied: true,
              },
            },
          },
        },
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
        Discount: true,
      },
      skip: offset,
      take: parseInt(limit, 10),
      orderBy: prismaOrderBy,
    });

    // Format response
    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      class: ticket.class,
      discount: ticket.Discount,
      isTransits: ticket.isTransits,
      price: ticket.price,
      totalPrice: ticket.totalPrice,
      totalDuration: ticket.totalDuration,
      isActive: ticket.isActive,
      departure: {
        time: ticket.departureTime,
        airport: {
          name: ticket.Route.DepartureAirport.name,
          code: ticket.Route.DepartureAirport.iataCode,
          type: ticket.Route.DepartureAirport.type,
        },
        city: {
          name: ticket.Route.DepartureAirport.City.name,
          code: ticket.Route.DepartureAirport.City.code,
          image: ticket.Route.DepartureAirport.City.imageUrl,
        },
        country: {
          name: ticket.Route.DepartureAirport.City.country,
          code: ticket.Route.DepartureAirport.City.countryCode,
        },
      },
      arrival: {
        time: ticket.arrivalTime,
        airport: {
          name: ticket.Route.ArrivalAirport.name,
          code: ticket.Route.ArrivalAirport.iataCode,
          type: ticket.Route.ArrivalAirport.type,
        },
        city: {
          name: ticket.Route.ArrivalAirport.City.name,
          code: ticket.Route.ArrivalAirport.City.code,
          image: ticket.Route.ArrivalAirport.City.imageUrl,
        },
        country: {
          name: ticket.Route.ArrivalAirport.City.country,
          code: ticket.Route.ArrivalAirport.City.countryCode,
        },
        continent: ticket.Route.ArrivalAirport.City.continent,
      },
      flights: ticket.Flights.map((flight) => {
        const totalSeats = flight.Seat.length;
        const occupiedSeats = flight.Seat.filter(
          (seat) => seat.isOccupied
        ).length;
        const availableSeats = totalSeats - occupiedSeats;

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
          totalSeats,
          occupiedSeats,
          availableSeats,
        };
      }),
    }));

    const totalTickets = await prisma.ticket.count({ where: searchFilters });

    const pagination = {
      totalItems: totalTickets,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalTickets / limit),
      pageSize: parseInt(limit),
    };

    return {
      formattedTickets,
      pagination,
    };
  } catch (error) {
    console.error("Error getting tickets:", error);
    throw error;
  }
};

// TODO Get ticket by ID
export const getById = async (id) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: {
        id,
      },
      include: {
        Flights: {
          orderBy: {
            departureTime: "asc",
          },
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
                Airline: true,
              },
            },
            DepartureTerminal: true,
            ArrivalTerminal: true,
            Seat: {
              orderBy: {
                seatNumber: "asc",
              },
            },
          },
        },
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
        Discount: true,
      },
    });

    if (!ticket) {
      throw new AppError("Tiket not found", 404);
    }

    const formattedTicket = {
      id: ticket.id,
      class: ticket.class,
      isTransits: ticket.isTransits,
      price: ticket.price,
      totalPrice: ticket.totalPrice,
      totalDuration: ticket.totalDuration,
      discount: ticket.Discount,
      isActive: ticket.isActive,
      departure: {
        time: ticket.departureTime,
        airport: {
          name: ticket.Route.DepartureAirport.name,
          code: ticket.Route.DepartureAirport.iataCode,
          type: ticket.Route.DepartureAirport.type,
        },
        city: {
          name: ticket.Route.DepartureAirport.City.name,
          code: ticket.Route.DepartureAirport.City.code,
          image: ticket.Route.DepartureAirport.City.imageUrl,
        },
        country: {
          name: ticket.Route.DepartureAirport.City.country,
          code: ticket.Route.DepartureAirport.City.countryCode,
        },
      },
      arrival: {
        time: ticket.arrivalTime,
        airport: {
          name: ticket.Route.ArrivalAirport.name,
          code: ticket.Route.ArrivalAirport.iataCode,
          type: ticket.Route.ArrivalAirport.type,
        },
        city: {
          name: ticket.Route.ArrivalAirport.City.name,
          code: ticket.Route.ArrivalAirport.City.code,
          image: ticket.Route.ArrivalAirport.City.imageUrl,
        },
        country: {
          name: ticket.Route.ArrivalAirport.City.country,
          code: ticket.Route.ArrivalAirport.City.countryCode,
        },
        continent: ticket.Route.ArrivalAirport.City.continent,
      },
      flights: ticket.Flights.map((flight) => {
        const totalSeats = flight.Seat.length;
        const occupiedSeats = flight.Seat.filter(
          (seat) => seat.isOccupied
        ).length;
        const availableSeats = totalSeats - occupiedSeats;

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
          seats: flight.Seat,
          totalSeats,
          occupiedSeats,
          availableSeats,
        };
      }),
    };

    return formattedTicket;
  } catch (error) {
    console.error("Error fetching ticket by ID:", error);
    throw error;
  }
};

// TODO Create ticket
export const store = async (payload) => {
  try {
    const { routeId, flightIds, discountId = null } = payload;

    // Validate flights
    const flights = await validateFlights({ routeId, flightIds });

    // Calculate total price and duration
    let totalPrice = calculatePrice(flights);
    let totalDuration = calculateDuration(flights);

    if (discountId) {
      const discount = await prisma.discount.findUnique({
        where: { id: discountId },
      });

      if (!discount) {
        throw new AppError("Discount not found", 404);
      }

      totalPrice = totalPrice - totalPrice * (discount.percentage / 100);
    }

    const ticket = await prisma.ticket.create({
      data: {
        routeId,
        class: flights[0].class,
        isTransits: flights.length > 1,
        departureTime: flights[0].departureTime,
        arrivalTime: flights[flights.length - 1].arrivalTime,
        totalPrice,
        totalDuration,
        discountId,
        Flights: {
          connect: flightIds.map((id) => ({ id })),
        },
      },
      include: {
        Flights: true,
      },
    });

    return ticket;
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
};

// TODO Delete ticket
export const destroy = async (id) => {
  try {
    const ticketExists = await prisma.ticket.findUnique({
      where: {
        id,
      },
      include: {
        Flights: true,
      },
    });

    if (!ticketExists) {
      throw new AppError("Ticket not found", 404);
    }

    const flightIds = ticketExists.Flights.map((flight) => flight.id);

    await prisma.ticket.delete({
      where: {
        id,
      },
    });

    if (flightIds.length === 1) {
      await prisma.flight.delete({
        where: {
          id: flightIds[0],
        },
      });
    }

    return {
      message: "Ticket deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting ticket:", error);
    throw error;
  }
};
