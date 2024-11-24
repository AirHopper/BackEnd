// import prisma from "../utils/prisma.js";
import AppError from "../utils/AppError.js";

// data dummy formattedFlights
const formattedFlightsDummy = [
  {
    id: 1,
    class: "Economy",
    airline: "Air France",
    airplane: "Airbus A380",
    departure: {
      place: "Paris",
      airport: {
        name: "Charles de Gaulle Airport",
        code: "CDG",
      },
      city: {
        name: "Paris",
        code: "PAR",
      },
      country: {
        name: "France",
        code: "FR",
      },
      time: "2021-12-01T10:00:00.000Z",
      terminal: "A",
    },
    arrival: {
      place: "New York",
      airport: {
        name: "John F. Kennedy International Airport",
        code: "JFK",
      },
      city: {
        name: "New York",
        code: "NYC",
      },
      country: {
        name: "United States",
        code: "US",
      },
      time: "2021-12-01T13:00:00.000Z",
      terminal: "B",
    },
    isActive: true,
    price: 500,
    baggage: "20kg",
    cabinBaggage: "7kg",
    entertainment: "Movies, Music, Games",
    discount: 0,
  },
  {
    id: 2,
    class: "Business",
    airline: "Emirates",
    airplane: "Boeing 777",
    departure: {
      place: "Dubai",
      airport: {
        name: "Dubai International Airport",
        code: "DXB",
      },
      city: {
        name: "Dubai",
        code: "DXB",
      },
      country: {
        name: "United Arab Emirates",
        code: "AE",
      },
      time: "2021-12-01T08:00:00.000Z",
      terminal: "C",
    },
    arrival: {
      place: "London",
      airport: {
        name: "Heathrow Airport",
        code: "LHR",
      },
      city: {
        name: "London",
        code: "LON",
      },
      country: {
        name: "United Kingdom",
        code: "UK",
      },
      time: "2021-12-01T12:00:00.000Z",
      terminal: "D",
    },
    isActive: true,
    price: 800,
    baggage: "30kg",
    cabinBaggage: "10kg",
    entertainment: "Movies, Music, Games",
    discount: 0,
  },
];

export const getAllFlights = async (req, res) => {
  try {
    // const flights = await prisma.flight.findMany({
    //   include: {
    //     Route: {
    //       include: {
    //         DepartureAirport: true,
    //         ArrivalAirport: true,
    //       },
    //     },
    //     Airplane: {
    //       include: {
    //         Airline: true,
    //       },
    //     },
    //     DepartureTerminal: true,
    //     ArrivalTerminal: true,
    //     Discount: true,
    //   },
    // });

    // if (!flights.length) {
    //   throw new AppError("No flights found", 404);
    // }

    // // Format response
    // const formattedFlights = flights.map((flight) => ({
    //   id: flight.id,
    //   class: flight.class,
    //   airline: flight.Airplane.Airline.name,
    //   airplane: flight.Airplane.name,
    //   departure: {
    //     place: flight.Route.DepartureAirport.city,
    //     airport: {
    //       name: flight.Route.DepartureAirport.name,
    //       code: flight.Route.DepartureAirport.iataCode,
    //     },
    //     city: {
    //       name: flight.Route.DepartureAirport.city,
    //       code: flight.Route.DepartureAirport.cityCode,
    //     },
    //     country: {
    //       name: flight.Route.DepartureAirport.country,
    //       code: flight.Route.DepartureAirport.countryCode,
    //     },
    //     time: flight.departureTime,
    //     terminal: flight.DepartureTerminal.name,
    //   },
    //   arrival: {
    //     place: flight.Route.ArrivalAirport.city,
    //     airport: {
    //       name: flight.Route.ArrivalAirport.name,
    //       code: flight.Route.ArrivalAirport.iataCode,
    //     },
    //     city: {
    //       name: flight.Route.ArrivalAirport.city,
    //       code: flight.Route.ArrivalAirport.cityCode,
    //     },
    //     country: {
    //       name: flight.Route.ArrivalAirport.country,
    //       code: flight.Route.ArrivalAirport.countryCode,
    //     },
    //     time: flight.arrivalTime,
    //     terminal: flight.ArrivalTerminal.name,
    //   },
    //   isActive: flight.isActive,
    //   price: flight.price,
    //   baggage: flight.baggage,
    //   cabinBaggage: flight.cabinBaggage,
    //   entertainment: flight.entertainment,
    //   discount: flight.Discount ? flight.Discount.discount : 0,
    // }));

    return formattedFlightsDummy;
  } catch (error) {
    console.error("Database Error:", error); // Log detail error
    throw new AppError("Database query failed", 500, error.message);
  }
};
