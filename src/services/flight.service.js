import prisma from "../utils/prisma.js";
import AppError from "../utils/AppError.js";

// TODO Get all flights
export const getAllFlights = async ({ page = 1, limit = 10, search }) => {
  try {
    const offset = (page - 1) * limit;

    // Query flights with optional search
    const where = search
      ? {
          OR: [
            { "Route.DepartureAirport.city": { contains: search, mode: "insensitive" } },
            { "Route.ArrivalAirport.city": { contains: search, mode: "insensitive" } },
            { "Airplane.Airline.name": { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const flights = await prisma.Flight.findMany({
      where,
      include: {
        Route: {
          include: {
            DepartureAirport: true,
            ArrivalAirport: true,
          },
        },
        Airplane: {
          include: {
            Airline: true,
          },
        },
        DepartureTerminal: true,
        ArrivalTerminal: true,
        Discount: true,
      },
      skip: offset,
      take: parseInt(limit, 10),
    });

    const totalFlights = await prisma.Flight.count({ where });

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
        place: flight.Route.DepartureAirport.city,
        airport: {
          name: flight.Route.DepartureAirport.name,
          code: flight.Route.DepartureAirport.iataCode,
        },
        city: {
          name: flight.Route.DepartureAirport.city,
          code: flight.Route.DepartureAirport.cityCode,
        },
        country: {
          name: flight.Route.DepartureAirport.country,
          code: flight.Route.DepartureAirport.countryCode,
        },
        time: flight.departureTime,
        terminal: flight.DepartureTerminal.name,
      },
      arrival: {
        place: flight.Route.ArrivalAirport.city,
        airport: {
          name: flight.Route.ArrivalAirport.name,
          code: flight.Route.ArrivalAirport.iataCode,
        },
        city: {
          name: flight.Route.ArrivalAirport.city,
          code: flight.Route.ArrivalAirport.cityCode,
        },
        country: {
          name: flight.Route.ArrivalAirport.country,
          code: flight.Route.ArrivalAirport.countryCode,
        },
        time: flight.arrivalTime,
        terminal: flight.ArrivalTerminal.name,
      },
      isActive: flight.isActive,
      price: flight.price,
      baggage: flight.baggage,
      cabinBaggage: flight.cabinBaggage,
      entertainment: flight.entertainment,
      discount: flight.Discount ? flight.Discount.discount : 0,
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
export const getFlightById = async (id) => {
  try {
    const flight = await prisma.Flight.findUnique({
      where: {
        id,
      },
      include: {
        Route: {
          include: {
            DepartureAirport: true,
            ArrivalAirport: true,
          },
        },
        Airplane: {
          include: {
            Airline: true,
          },
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
        place: flight.Route.DepartureAirport.city,
        airport: {
          name: flight.Route.DepartureAirport.name,
          code: flight.Route.DepartureAirport.iataCode,
        },
        city: {
          name: flight.Route.DepartureAirport.city,
          code: flight.Route.DepartureAirport.cityCode,
        },
        country: {
          name: flight.Route.DepartureAirport.country,
          code: flight.Route.DepartureAirport.countryCode,
        },
        time: flight.departureTime,
        terminal: flight.DepartureTerminal.name,
      },
      arrival: {
        place: flight.Route.ArrivalAirport.city,
        airport: {
          name: flight.Route.ArrivalAirport.name,
          code: flight.Route.ArrivalAirport.iataCode,
        },
        city: {
          name: flight.Route.ArrivalAirport.city,
          code: flight.Route.ArrivalAirport.cityCode,
        },
        country: {
          name: flight.Route.ArrivalAirport.country,
          code: flight.Route.ArrivalAirport.countryCode,
        },
        time: flight.arrivalTime,
        terminal: flight.ArrivalTerminal.name,
      },
      isActive: flight.isActive,
      price: flight.price,
      baggage: flight.baggage,
      cabinBaggage: flight.cabinBaggage,
      entertainment: flight.entertainment,
      discount: flight.Discount ? flight.Discount.discount : 0,
    };

    return formattedFlight;
  } catch (error) {
    console.error("Error geting flight data:", error);
    throw error;
  }
};

// TODO Search flights at parameters query

// TODO Create flight
export const storeFlight = async (req) => {
  try {
    const { routeId, class: classType, isActive = true, airplaneId, departureTime, arrivalTime, duration, price, capacity = null, baggage, cabinBaggage, entertainment, departureTerminalId, arrivalTerminalId, discountId = null } = req.body;

    if (!routeId || !classType || !airplaneId || !departureTime || !arrivalTime || !duration || !price || !baggage || !cabinBaggage || !departureTerminalId || !arrivalTerminalId) {
      throw new AppError("Missing required fields", 400);
    }

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
export const updateFlight = async (req) => {
  try {
    const { id } = req.params;
    const { routeId, class: classType, isActive, airplaneId, departureTime, arrivalTime, duration, price, capacity, baggage, cabinBaggage, entertainment, departureTerminalId, arrivalTerminalId, discountId } = req.body;

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
export const destroyFlight = async (id) => {
  try {
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
