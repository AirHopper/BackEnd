import prisma from "../utils/prisma.js";
import AppError from "../utils/AppError.js";

// TODO Get all flights
export const getAllFlights = async () => {
  try {
    const flights = await prisma.Flight.findMany({
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

    return {
      formattedFlights,
    };
  } catch (error) {
    console.error("Error geting flight data:", error);
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
// TODO Update flight
// TODO Delete flight
