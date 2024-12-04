import prisma from "../utils/prisma.js";
import AppError from "../utils/AppError.js";

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
  });

  // Validate all flights exist
  if (flights.length !== flightIds.length) {
    throw new AppError("Some flights could not be found", 400);
  }

  // Ensure all flights are on the same day and class type
  const firstFlightDate = new Date(firstFlight.departureTime).toDateString();
  const classType = firstFlight.class;

  for (const flight of flights) {
    if (new Date(flight.departureTime).toDateString() !== firstFlightDate) {
      throw new AppError("All flights must be on the same day", 400);
    }

    if (flight.class !== classType) {
      throw new AppError("All flights must be of the same class type", 400);
    }
  }

  // Validate first and last flights match the route's airports
  const firstFlight = flights[0];
  const lastFlight = flights[flights.length - 1];

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
  return flights.reduce((total, flight) => total + flight.price, 0);
}

// Calculate total duration of all flights
function calculateDuration(flights) {
  return flights.reduce((total, flight) => total + flight.duration, 0);
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

    const { departureCity, arrivalCity, flightDate, classType, continent } =
      search || {};

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
        ...[
          {
            isActive: true,
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
        skip: offset,
        take: parseInt(limit, 10),
        orderBy: prismaOrderBy,
      },
    });

    // Format response
    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      class: ticket.class,
      price: ticket.price,
      totalPrice: ticket.totalPrice,
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
      flights: ticket.Flights.map((flight) => ({
        id: flight.id,
        duration: flight.duration,
        baggage: flight.baggage,
        cabinBaggage: flight.cabinBaggage,
        entertainment: flight.entertainment,
        airline: flight.Airplane.Airline.name,
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
      })),
    }));

    const totalTickets = await prisma.ticket.count({ where: searchFilters });

    if (!tickets.length) {
      throw new AppError("No tickets found", 404);
    }

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
    // Fetch ticket by ID, including all necessary relations
    const ticket = await prisma.ticket.findUnique({
      where: { id },
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
                Airline: true,
              },
            },
            DepartureTerminal: true,
            ArrivalTerminal: true,
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
      },
    });

    // If ticket is not found
    if (!ticket) {
      return null;
    }

    // Format the ticket response
    const formattedTicket = {
      id: ticket.id,
      class: ticket.class,
      price: ticket.price,
      totalPrice: ticket.totalPrice,
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
      flights: ticket.Flights.map((flight) => ({
        id: flight.id,
        duration: flight.duration,
        baggage: flight.baggage,
        cabinBaggage: flight.cabinBaggage,
        entertainment: flight.entertainment,
        airline: flight.Airplane.Airline.name,
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
      })),
    };

    return formattedTicket;
  } catch (error) {
    console.error("Error fetching ticket by ID:", error);
    throw new Error("Failed to retrieve ticket.");
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
    let discountPrice = null;

    if (discountId) {
      const discount = await prisma.discount.findUnique({
        where: { id: discountId },
      });

      if (!discount) {
        throw new AppError("Discount not found", 404);
      }

      discountPrice = totalPrice - totalPrice * (discount.percentage / 100);
    }

    const ticket = await prisma.ticket.create({
      data: {
        routeId,
        class: flights[0].class,
        isTransits: flights.length > 1,
        departureTime: flights[0].departureTime,
        arrivalTime: flights[flights.length - 1].arrivalTime,
        totalPrice,
        discountPrice,
        totalDuration,
        Discount: discountId ? { connect: { id: discountId } } : undefined,
        Flights: {
          connect: flightIds.map((id) => ({ id })),
        },
      },
      include: {
        Flights: true,
        Discount: true,
      },
    });

    return ticket;
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
};

// TODO Update flight
// export const update = async (id, payload) => {

// }

// TODO Delete ticket
export const destroy = async (id) => {
  try {
    if (isNaN(id)) {
      throw new AppError("Invalid ticket ID", 400);
    }

    const ticketExists = await prisma.ticket.findUnique({
      where: {
        id,
      },
    });

    if (!ticketExists) {
      throw new AppError("Ticket not found", 404);
    }

    await prisma.ticket.delete({
      where: {
        id,
      },
    });

    return {
      message: "Ticket deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting ticket:", error);
    throw error;
  }
};