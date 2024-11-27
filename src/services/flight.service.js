import prisma from "../utils/prisma.js";
import AppError from "../utils/AppError.js";

// TODO Get all flights
export const getAll = async ({ page = 1, limit = 10, search }) => {
  try {
    const offset = (page - 1) * limit;

    const searchFilters = search
      ? {
          OR: [
            { Airplane: { Airline: { name: { contains: search, mode: "insensitive" } } } },
            { Route: { DepartureAirport: { City: { name: { contains: search, mode: "insensitive" } } } } },
            { Route: { DepartureAirport: { City: { code: { contains: search, mode: "insensitive" } } } } },
            { Route: { ArrivalAirport: { City: { name: { contains: search, mode: "insensitive" } } } } },
            { Route: { ArrivalAirport: { City: { code: { contains: search, mode: "insensitive" } } } } },
          ],
        }
      : {};

    // Fetch flights
    const flights = await prisma.Flight.findMany({
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
        Discount: true,
      },
      skip: offset,
      take: parseInt(limit, 10),
    });

    // Count total flights
    const totalFlights = await prisma.Flight.count({ where: searchFilters });

    if (!flights.length) {
      throw new AppError("No flights found", 404);
    }

    // Format response
    const formattedFlights = flights.map((flight) => ({
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
      isActive: flight.isActive,
      baggage: flight.baggage,
      cabinBaggage: flight.cabinBaggage,
      entertainment: flight.entertainment,
      price: flight.price,
      discount: flight.Discount ? flight.Discount.discount : 0,
      totalPrice: flight.price - (flight.price * (flight.Discount ? flight.Discount.discount : 0)) / 100,
    }));

    const pagination = {
      totalItems: totalFlights,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalFlights / limit),
      pageSize: parseInt(limit, 10),
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

    const flight = await prisma.Flight.findUnique({
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
        Discount: true,
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
      isActive: flight.isActive,
      baggage: flight.baggage,
      cabinBaggage: flight.cabinBaggage,
      entertainment: flight.entertainment,
      price: flight.price,
      discount: flight.Discount ? flight.Discount.discount : 0,
      totalPrice: flight.price - (flight.price * (flight.Discount ? flight.Discount.discount : 0)) / 100,
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
    const { routeId, class: classType, isActive = true, airplaneId, departureTime, arrivalTime, duration, price, capacity = null, baggage, cabinBaggage, entertainment, departureTerminalId, arrivalTerminalId, discountId = null } = payload;

    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(arrivalTime);

    if (departureDate >= arrivalDate) {
      throw new AppError("Departure time must be earlier than arrival time", 400);
    }

    const routeExists = await prisma.Route.findUnique({
      where: {
        id: routeId,
      },
    });

    if (!routeExists) {
      throw new AppError("Route not found", 404);
    }

    const airplaneExists = await prisma.Airplane.findUnique({
      where: {
        id: airplaneId,
      },
    });

    if (!airplaneExists) {
      throw new AppError("Airplane not found", 404);
    }

    const departureTerminalExists = await prisma.Terminal.findUnique({
      where: {
        id: departureTerminalId,
      },
    });

    if (!departureTerminalExists) {
      throw new AppError("Departure terminal not found", 404);
    }

    const arrivalTerminalExists = await prisma.Terminal.findUnique({
      where: {
        id: arrivalTerminalId,
      },
    });

    if (!arrivalTerminalExists) {
      throw new AppError("Arrival terminal not found", 404);
    }

    if (discountId) {
      const discountExists = await prisma.Discount.findUnique({
        where: {
          id: discountId,
        },
      });

      if (!discountExists) {
        throw new AppError("Discount not found", 404);
      }
    }

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
        discountId,
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

    const { routeId, class: classType, isActive, airplaneId, departureTime, arrivalTime, duration, price, capacity, baggage, cabinBaggage, entertainment, departureTerminalId, arrivalTerminalId, discountId } = payload;

    const flightExists = await prisma.Flight.findUnique({
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
    const updatedDepartureTime = departureTime ? new Date(departureTime) : flightExists.departureTime;
    const updatedArrivalTime = arrivalTime ? new Date(arrivalTime) : flightExists.arrivalTime;
    const updatedDuration = duration ?? flightExists.duration;
    const updatedPrice = price ?? flightExists.price;
    const updatedCapacity = capacity ?? flightExists.capacity;
    const updatedBaggage = baggage ?? flightExists.baggage;
    const updatedCabinBaggage = cabinBaggage ?? flightExists.cabinBaggage;
    const updatedEntertainment = entertainment ?? flightExists.entertainment;
    const updatedDepartureTerminalId = departureTerminalId ?? flightExists.departureTerminalId;
    const updatedArrivalTerminalId = arrivalTerminalId ?? flightExists.arrivalTerminalId;
    const updatedDiscountId = discountId ?? flightExists.discountId;

    if (updatedDepartureTime >= updatedArrivalTime) {
      throw new AppError("Departure time must be earlier than arrival time", 400);
    }

    const routeExists = await prisma.Route.findUnique({
      where: {
        id: updatedRouteId,
      },
    });
    if (!routeExists) {
      throw new AppError("Route not found", 404);
    }

    const airplaneExists = await prisma.Airplane.findUnique({
      where: {
        id: updatedAirplaneId,
      },
    });
    if (!airplaneExists) {
      throw new AppError("Airplane not found", 404);
    }

    const departureTerminalExists = await prisma.Terminal.findUnique({
      where: {
        id: updatedDepartureTerminalId,
      },
    });
    if (!departureTerminalExists) {
      throw new AppError("Departure terminal not found", 404);
    }

    const arrivalTerminalExists = await prisma.Terminal.findUnique({
      where: {
        id: updatedArrivalTerminalId,
      },
    });
    if (!arrivalTerminalExists) {
      throw new AppError("Arrival terminal not found", 404);
    }

    if (updatedDiscountId) {
      const discountExists = await prisma.Discount.findUnique({
        where: {
          id: updatedDiscountId,
        },
      });
      if (!discountExists) {
        throw new AppError("Discount not found", 404);
      }
    }

    const updatedFlight = await prisma.Flight.update({
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
        price: updatedPrice,
        capacity: updatedCapacity,
        baggage: updatedBaggage,
        cabinBaggage: updatedCabinBaggage,
        entertainment: updatedEntertainment,
        departureTerminalId: updatedDepartureTerminalId,
        arrivalTerminalId: updatedArrivalTerminalId,
        discountId: updatedDiscountId,
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

    const flightExists = await prisma.Flight.findUnique({
      where: {
        id,
      },
    });

    if (!flightExists) {
      throw new AppError("Flight not found", 404);
    }

    await prisma.Flight.delete({
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