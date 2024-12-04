import prisma from "../utils/prisma.js";
import AppError from "../utils/AppError.js";

// Calculate flight price
async function calculatePrice(distance, pricePerKm, classType) {
  let price = 0;

  // Calculate price based on distance and price per km
  price = distance * pricePerKm;

  // Price multiplier based on class type
  const economy = 1; // Default
  const premiumEconomy = 1.5; // 50% more expensive
  const business = 6; // 500% more expensive
  const firstClass = 17.5; // 1650% more expensive

  price *=
    classType === "Economy"
      ? economy
      : classType === "Premium_Economy"
      ? premiumEconomy
      : classType === "Business"
      ? business
      : firstClass;

  return price;
}

// Calculate flight capacity based on class type
function flightCapacity(classType) {
  let capacity =
    classType === "Economy"
      ? 72
      : classType === "Premium_economy"
      ? 24
      : classType === "Business"
      ? 18
      : 6;

  return capacity;
}

// Calculate flight duration in minutes
function flightDuration(departureTime, arrivalTime) {
  const diff = arrivalTime - departureTime;
  const minutes = 1000 * 60;
  const duration = Math.floor(diff / minutes);

  return duration;
}

// TODO Get all flights
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

    // Build search filters
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

    // Determine orderBy
    const prismaOrderBy = (() => {
      switch (orderBy) {
        case "price_asc":
          return { price: "asc" };
        case "duration_asc":
          return { duration: "asc" };
        case "departure_soon":
          return { departureTime: "asc" };
        case "departure_late":
          return { departureTime: "desc" };
        case "arrival_soon":
          return { arrivalTime: "asc" };
        case "arrival_late":
          return { arrivalTime: "desc" };
        default:
          return { price: "asc" };
      }
    })();

    // Fetch flights
    const flights = await prisma.flight.findMany({
      where: searchFilters,
      include: {
        Route: {
          include: {
            DepartureAirport: {
              include: { City: true },
            },
            ArrivalAirport: {
              include: { City: true },
            },
          },
        },
        Airplane: {
          include: { Airline: true },
        },
        DepartureTerminal: true,
        ArrivalTerminal: true,
      },
      skip: offset,
      take: parseInt(limit, 10),
      orderBy: prismaOrderBy,
    });

    // Count total flights
    const totalFlights = await prisma.flight.count({ where: searchFilters });

    if (!flights.length) {
      throw new AppError("No flights found", 404);
    }

    // Format response
    const formattedFlights = flights.map((flight) => ({
      id: flight.id,
      class: flight.class,
      airline: flight.Airplane.Airline.name,
      airplane: flight.Airplane.name,
      duration: flight.duration,
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
        terminal: {
          name: flight.DepartureTerminal.name,
          type: flight.DepartureTerminal.type,
        },
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
        terminal: {
          name: flight.ArrivalTerminal.name,
          type: flight.ArrivalTerminal.type,
        },
      },
      isActive: flight.isActive,
      baggage: flight.baggage,
      cabinBaggage: flight.cabinBaggage,
      entertainment: flight.entertainment,
      price: flight.price,
      totalPrice: flight.price,
    }));

    const pagination = {
      totalItems: totalFlights,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalFlights / limit),
      pageSize: parseInt(limit),
    };

    return {
      formattedFlights,
      pagination,
    };
  } catch (error) {
    console.error("Error getting flight data:", error);
    throw error;
  }
};

// TODO Get flight by ID
export const getById = async (id) => {
  try {
    if (isNaN(id)) {
      throw new AppError("Invalid flight ID", 400);
    }

    const flight = await prisma.flight.findUnique({
      where: {
        id,
      },
      include: {
        Route: {
          include: {
            DepartureAirport: {
              include: { City: true },
            },
            ArrivalAirport: {
              include: { City: true },
            },
          },
        },
        Airplane: {
          include: { Airline: true },
        },
        DepartureTerminal: true,
        ArrivalTerminal: true,
        Seat: true,
      },
    });

    if (!flight) {
      throw new AppError("Flight not found", 404);
    }

    // Format response
    const formattedFlight = {
      id: flight.id,
      class: flight.class,
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
        terminal: {
          name: flight.DepartureTerminal.name,
          type: flight.DepartureTerminal.type,
        },
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
        terminal: {
          name: flight.ArrivalTerminal.name,
          type: flight.ArrivalTerminal.type,
        },
      },
      Seat: flight.Seat,
      isActive: flight.isActive,
      baggage: flight.baggage,
      cabinBaggage: flight.cabinBaggage,
      entertainment: flight.entertainment,
      price: flight.price,
      totalPrice: flight.price,
    };

    return formattedFlight;
  } catch (error) {
    console.error("Error geting flight data:", error);
    throw error;
  }
};

// TODO Create flight
export const store = async (payload) => {
  try {
    const {
      routeId,
      class: classType,
      isActive = true,
      airplaneId,
      departureTime,
      arrivalTime,
      baggage,
      cabinBaggage,
      entertainment,
      departureTerminalId,
      arrivalTerminalId,
      discountId = null,
    } = payload;

    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(arrivalTime);

    if (departureDate >= arrivalDate) {
      throw new AppError(
        "Departure time must be earlier than arrival time",
        400
      );
    }

    const route = await prisma.route.findUnique({
      where: {
        id: routeId,
      },
    });

    if (!route) {
      throw new AppError("Route not found", 404);
    }

    const airplane = await prisma.airplane.findUnique({
      where: {
        id: airplaneId,
      },
    });

    if (!airplane) {
      throw new AppError("Airplane not found", 404);
    }

    const departureTerminalExists = await prisma.terminal.findUnique({
      where: {
        id: departureTerminalId,
      },
    });

    if (!departureTerminalExists) {
      throw new AppError("Departure terminal not found", 404);
    }

    const arrivalTerminalExists = await prisma.terminal.findUnique({
      where: {
        id: arrivalTerminalId,
      },
    });

    if (!arrivalTerminalExists) {
      throw new AppError("Arrival terminal not found", 404);
    }

    // Calculate price
    const price = await calculatePrice(
      route.distance,
      airplane.pricePerKm,
      classType
    );

    let discountPrice = null;

    if (discountId) {
      const discount = await prisma.discount.findUnique({
        where: {
          id: discountId,
        },
      });

      discountPrice = price - price * (discount.percentage / 100);

      if (!discount) {
        throw new AppError("Discount not found", 404);
      }
    }

    // Calculate capacity based on class type
    const capacity = flightCapacity(classType);

    // Calculate duration in minutes
    const duration = flightDuration(departureDate, arrivalDate);

    // Membuat data flight
    const flight = await prisma.flight.create({
      data: {
        routeId,
        class: classType,
        isActive,
        airplaneId,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        duration,
        price,
        capacity,
        baggage,
        cabinBaggage,
        entertainment,
        departureTerminalId,
        arrivalTerminalId,
        Seat: {
          create: Array.from({ length: capacity }, (_, index) => ({
            seatNumber: index + 1,
            isOccupied: false,
          })),
        },
        Ticket: {
          create: {
            routeId,
            class: classType,
            isTransits: false,
            departureTime: new Date(departureTime),
            arrivalTime: new Date(arrivalTime),
            totalPrice: price,
            discountPrice,
            totalDuration: duration,
            discountId,
          },
        },
      },
      include: {
        Ticket: true,
      },
    });

    return flight;
  } catch (error) {
    console.error("Error creating flight:", error);
    throw error;
  }
};

// TODO Update flight
export const update = async (payload, id) => {
  try {
    if (isNaN(id)) {
      throw new AppError("Invalid flight ID", 400);
    }

    const {
      routeId,
      class: classType,
      isActive,
      airplaneId,
      departureTime,
      arrivalTime,
      duration,
      baggage,
      cabinBaggage,
      entertainment,
      departureTerminalId,
      arrivalTerminalId,
      discountId=null,
    } = payload;

    const flightExists = await prisma.flight.findUnique({
      where: {
        id,
      },
    });

    if (!flightExists) {
      throw new AppError("Flight not found", 404);
    }

    const updatedRouteId = routeId ?? flightExists.routeId;
    const updatedClass = classType ?? flightExists.class;
    const updatedIsActive = isActive ?? flightExists.isActive;
    const updatedAirplaneId = airplaneId ?? flightExists.airplaneId;
    const updatedDepartureTime = departureTime
      ? new Date(departureTime)
      : flightExists.departureTime;
    const updatedArrivalTime = arrivalTime
      ? new Date(arrivalTime)
      : flightExists.arrivalTime;
    const updatedDuration = duration ?? flightExists.duration;
    const updatedBaggage = baggage ?? flightExists.baggage;
    const updatedCabinBaggage = cabinBaggage ?? flightExists.cabinBaggage;
    const updatedEntertainment = entertainment ?? flightExists.entertainment;
    const updatedDepartureTerminalId =
      departureTerminalId ?? flightExists.departureTerminalId;
    const updatedArrivalTerminalId =
      arrivalTerminalId ?? flightExists.arrivalTerminalId;

    if (updatedDepartureTime >= updatedArrivalTime) {
      throw new AppError(
        "Departure time must be earlier than arrival time",
        400
      );
    }

    const routeExists = await prisma.route.findUnique({
      where: {
        id: updatedRouteId,
      },
    });
    if (!routeExists) {
      throw new AppError("Route not found", 404);
    }

    const airplaneExists = await prisma.airplane.findUnique({
      where: {
        id: updatedAirplaneId,
      },
    });
    if (!airplaneExists) {
      throw new AppError("Airplane not found", 404);
    }

    const departureTerminalExists = await prisma.terminal.findUnique({
      where: {
        id: updatedDepartureTerminalId,
      },
    });
    if (!departureTerminalExists) {
      throw new AppError("Departure terminal not found", 404);
    }

    const arrivalTerminalExists = await prisma.terminal.findUnique({
      where: {
        id: updatedArrivalTerminalId,
      },
    });
    if (!arrivalTerminalExists) {
      throw new AppError("Arrival terminal not found", 404);
    }

    const updatedFlight = await prisma.flight.update({
      where: {
        id,
      },
      data: {
        routeId: updatedRouteId,
        class: updatedClass,
        isActive: updatedIsActive,
        airplaneId: updatedAirplaneId,
        departureTime: updatedDepartureTime,
        arrivalTime: updatedArrivalTime,
        duration: updatedDuration,
        baggage: updatedBaggage,
        cabinBaggage: updatedCabinBaggage,
        entertainment: updatedEntertainment,
        departureTerminalId: updatedDepartureTerminalId,
        arrivalTerminalId: updatedArrivalTerminalId,
        discountId,
      },
    });

    return updatedFlight;
  } catch (error) {
    console.error("Error updating flight:", error);
    throw error;
  }
};

// TODO Delete flight
export const destroy = async (id) => {
  try {
    if (isNaN(id)) {
      throw new AppError("Invalid flight ID", 400);
    }

    const flightExists = await prisma.flight.findUnique({
      where: {
        id,
      },
    });

    if (!flightExists) {
      throw new AppError("Flight not found", 404);
    }

    await prisma.flight.delete({
      where: {
        id,
      },
    });

    return {
      message: "Flight deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting flight:", error);
    throw error;
  }
};
