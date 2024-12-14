import * as flightService from "../../services/flight.service";
import prismaMock from "../../utils/singleton";
import AppError from "../../utils/AppError";

describe("Flight Service", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getAll", () => {
    it("should return a paginated list of flights", async () => {
      const flights = [
        {
          id: 1,
          price: 500,
          duration: 150,
          isActive: true,
          Seat: [{ isOccupied: false }],
          Route: {
            DepartureAirport: {
              name: "Airport A",
              City: {
                name: "City A",
                code: "A1",
                country: "Country A",
                countryCode: "A",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              City: {
                name: "City B",
                code: "B1",
                country: "Country B",
                countryCode: "B",
              },
            },
          },
          Airplane: { name: "Airplane A", Airline: { name: "Airline A" } },
          departureTime: new Date("2023-12-11T10:00:00Z"),
          arrivalTime: new Date("2023-12-11T12:30:00Z"),
          DepartureTerminal: { name: "Terminal 1", type: "Domestic" },
          ArrivalTerminal: { name: "Terminal 2", type: "International" },
        },
      ];

      const expectedResponse = [
        {
          id: 1,
          class: undefined,
          airline: "Airline A",
          airplane: "Airplane A",
          duration: 150,
          departure: {
            time: "2023-12-11T10:00:00.000Z",
            airport: {
              name: "Airport A",
              code: undefined,
              type: undefined,
            },
            city: {
              name: "City A",
              code: "A1",
              image: undefined,
            },
            country: {
              name: "Country A",
              code: "A",
            },
            terminal: {
              name: "Terminal 1",
              type: "Domestic",
            },
          },
          arrival: {
            time: "2023-12-11T12:30:00.000Z",
            airport: {
              name: "Airport B",
              code: undefined,
              type: undefined,
            },
            city: {
              name: "City B",
              code: "B1",
              image: undefined,
            },
            country: {
              name: "Country B",
              code: "B",
            },
            continent: undefined,
            terminal: {
              name: "Terminal 2",
              type: "International",
            },
          },
          isActive: true,
          baggage: undefined,
          cabinBaggage: undefined,
          entertainment: undefined,
          price: 500,
          totalPrice: 500,
          totalSeats: 1,
          occupiedSeats: 0,
          availableSeats: 1,
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);
      prismaMock.flight.count.mockResolvedValue(1);

      const searchParams = {
        page: 1,
        limit: 10,
        search: {},
        orderBy: "default",
      };
      const result = await flightService.getAll(searchParams);

      // Convert Date objects to ISO string if they are Date objects
      result.formattedFlights.forEach((flight) => {
        flight.departure.time = flight.departure.time.toISOString();
        flight.arrival.time = flight.arrival.time.toISOString();
      });

      expect(result.formattedFlights).toEqual(expectedResponse);
      expect(result.pagination.totalItems).toBe(1);
    });

    it("should return a paginated list of flights (price_asc)", async () => {
      const flights = [
        {
          id: 1,
          price: 500,
          duration: 150,
          isActive: true,
          Seat: [{ isOccupied: false }],
          Route: {
            DepartureAirport: {
              name: "Airport A",
              City: {
                name: "City A",
                code: "A1",
                country: "Country A",
                countryCode: "A",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              City: {
                name: "City B",
                code: "B1",
                country: "Country B",
                countryCode: "B",
              },
            },
          },
          Airplane: { name: "Airplane A", Airline: { name: "Airline A" } },
          departureTime: new Date("2023-12-11T10:00:00Z"),
          arrivalTime: new Date("2023-12-11T12:30:00Z"),
          DepartureTerminal: { name: "Terminal 1", type: "Domestic" },
          ArrivalTerminal: { name: "Terminal 2", type: "International" },
        },
      ];

      const expectedResponse = [
        {
          id: 1,
          class: undefined,
          airline: "Airline A",
          airplane: "Airplane A",
          duration: 150,
          departure: {
            time: "2023-12-11T10:00:00.000Z",
            airport: {
              name: "Airport A",
              code: undefined,
              type: undefined,
            },
            city: {
              name: "City A",
              code: "A1",
              image: undefined,
            },
            country: {
              name: "Country A",
              code: "A",
            },
            terminal: {
              name: "Terminal 1",
              type: "Domestic",
            },
          },
          arrival: {
            time: "2023-12-11T12:30:00.000Z",
            airport: {
              name: "Airport B",
              code: undefined,
              type: undefined,
            },
            city: {
              name: "City B",
              code: "B1",
              image: undefined,
            },
            country: {
              name: "Country B",
              code: "B",
            },
            continent: undefined,
            terminal: {
              name: "Terminal 2",
              type: "International",
            },
          },
          isActive: true,
          baggage: undefined,
          cabinBaggage: undefined,
          entertainment: undefined,
          price: 500,
          totalPrice: 500,
          totalSeats: 1,
          occupiedSeats: 0,
          availableSeats: 1,
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);
      prismaMock.flight.count.mockResolvedValue(1);

      const searchParams = {
        page: 1,
        limit: 10,
        search: {},
        orderBy: "price_asc",
      };
      const result = await flightService.getAll(searchParams);

      // Convert Date objects to ISO string if they are Date objects
      result.formattedFlights.forEach((flight) => {
        flight.departure.time = flight.departure.time.toISOString();
        flight.arrival.time = flight.arrival.time.toISOString();
      });

      expect(result.formattedFlights).toEqual(expectedResponse);
      expect(result.pagination.totalItems).toBe(1);
    });

    it("should return a paginated list of flights (duration_asc)", async () => {
      const flights = [
        {
          id: 1,
          price: 500,
          duration: 150,
          isActive: true,
          Seat: [{ isOccupied: false }],
          Route: {
            DepartureAirport: {
              name: "Airport A",
              City: {
                name: "City A",
                code: "A1",
                country: "Country A",
                countryCode: "A",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              City: {
                name: "City B",
                code: "B1",
                country: "Country B",
                countryCode: "B",
              },
            },
          },
          Airplane: { name: "Airplane A", Airline: { name: "Airline A" } },
          departureTime: new Date("2023-12-11T10:00:00Z"),
          arrivalTime: new Date("2023-12-11T12:30:00Z"),
          DepartureTerminal: { name: "Terminal 1", type: "Domestic" },
          ArrivalTerminal: { name: "Terminal 2", type: "International" },
        },
      ];

      const expectedResponse = [
        {
          id: 1,
          class: undefined,
          airline: "Airline A",
          airplane: "Airplane A",
          duration: 150,
          departure: {
            time: "2023-12-11T10:00:00.000Z",
            airport: {
              name: "Airport A",
              code: undefined,
              type: undefined,
            },
            city: {
              name: "City A",
              code: "A1",
              image: undefined,
            },
            country: {
              name: "Country A",
              code: "A",
            },
            terminal: {
              name: "Terminal 1",
              type: "Domestic",
            },
          },
          arrival: {
            time: "2023-12-11T12:30:00.000Z",
            airport: {
              name: "Airport B",
              code: undefined,
              type: undefined,
            },
            city: {
              name: "City B",
              code: "B1",
              image: undefined,
            },
            country: {
              name: "Country B",
              code: "B",
            },
            continent: undefined,
            terminal: {
              name: "Terminal 2",
              type: "International",
            },
          },
          isActive: true,
          baggage: undefined,
          cabinBaggage: undefined,
          entertainment: undefined,
          price: 500,
          totalPrice: 500,
          totalSeats: 1,
          occupiedSeats: 0,
          availableSeats: 1,
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);
      prismaMock.flight.count.mockResolvedValue(1);

      const searchParams = {
        page: 1,
        limit: 10,
        search: {},
        orderBy: "duration_asc",
      };
      const result = await flightService.getAll(searchParams);

      // Convert Date objects to ISO string if they are Date objects
      result.formattedFlights.forEach((flight) => {
        flight.departure.time = flight.departure.time.toISOString();
        flight.arrival.time = flight.arrival.time.toISOString();
      });

      expect(result.formattedFlights).toEqual(expectedResponse);
      expect(result.pagination.totalItems).toBe(1);
    });

    it("should return a paginated list of flights (departure_soon)", async () => {
      const flights = [
        {
          id: 1,
          price: 500,
          duration: 150,
          isActive: true,
          Seat: [{ isOccupied: false }],
          Route: {
            DepartureAirport: {
              name: "Airport A",
              City: {
                name: "City A",
                code: "A1",
                country: "Country A",
                countryCode: "A",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              City: {
                name: "City B",
                code: "B1",
                country: "Country B",
                countryCode: "B",
              },
            },
          },
          Airplane: { name: "Airplane A", Airline: { name: "Airline A" } },
          departureTime: new Date("2023-12-11T10:00:00Z"),
          arrivalTime: new Date("2023-12-11T12:30:00Z"),
          DepartureTerminal: { name: "Terminal 1", type: "Domestic" },
          ArrivalTerminal: { name: "Terminal 2", type: "International" },
        },
      ];

      const expectedResponse = [
        {
          id: 1,
          class: undefined,
          airline: "Airline A",
          airplane: "Airplane A",
          duration: 150,
          departure: {
            time: "2023-12-11T10:00:00.000Z",
            airport: {
              name: "Airport A",
              code: undefined,
              type: undefined,
            },
            city: {
              name: "City A",
              code: "A1",
              image: undefined,
            },
            country: {
              name: "Country A",
              code: "A",
            },
            terminal: {
              name: "Terminal 1",
              type: "Domestic",
            },
          },
          arrival: {
            time: "2023-12-11T12:30:00.000Z",
            airport: {
              name: "Airport B",
              code: undefined,
              type: undefined,
            },
            city: {
              name: "City B",
              code: "B1",
              image: undefined,
            },
            country: {
              name: "Country B",
              code: "B",
            },
            continent: undefined,
            terminal: {
              name: "Terminal 2",
              type: "International",
            },
          },
          isActive: true,
          baggage: undefined,
          cabinBaggage: undefined,
          entertainment: undefined,
          price: 500,
          totalPrice: 500,
          totalSeats: 1,
          occupiedSeats: 0,
          availableSeats: 1,
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);
      prismaMock.flight.count.mockResolvedValue(1);

      const searchParams = {
        page: 1,
        limit: 10,
        search: {},
        orderBy: "departure_soon",
      };
      const result = await flightService.getAll(searchParams);

      // Convert Date objects to ISO string if they are Date objects
      result.formattedFlights.forEach((flight) => {
        flight.departure.time = flight.departure.time.toISOString();
        flight.arrival.time = flight.arrival.time.toISOString();
      });

      expect(result.formattedFlights).toEqual(expectedResponse);
      expect(result.pagination.totalItems).toBe(1);
    });

    it("should return a paginated list of flights (departure_late)", async () => {
      const flights = [
        {
          id: 1,
          price: 500,
          duration: 150,
          isActive: true,
          Seat: [{ isOccupied: false }],
          Route: {
            DepartureAirport: {
              name: "Airport A",
              City: {
                name: "City A",
                code: "A1",
                country: "Country A",
                countryCode: "A",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              City: {
                name: "City B",
                code: "B1",
                country: "Country B",
                countryCode: "B",
              },
            },
          },
          Airplane: { name: "Airplane A", Airline: { name: "Airline A" } },
          departureTime: new Date("2023-12-11T10:00:00Z"),
          arrivalTime: new Date("2023-12-11T12:30:00Z"),
          DepartureTerminal: { name: "Terminal 1", type: "Domestic" },
          ArrivalTerminal: { name: "Terminal 2", type: "International" },
        },
      ];

      const expectedResponse = [
        {
          id: 1,
          class: undefined,
          airline: "Airline A",
          airplane: "Airplane A",
          duration: 150,
          departure: {
            time: "2023-12-11T10:00:00.000Z",
            airport: {
              name: "Airport A",
              code: undefined,
              type: undefined,
            },
            city: {
              name: "City A",
              code: "A1",
              image: undefined,
            },
            country: {
              name: "Country A",
              code: "A",
            },
            terminal: {
              name: "Terminal 1",
              type: "Domestic",
            },
          },
          arrival: {
            time: "2023-12-11T12:30:00.000Z",
            airport: {
              name: "Airport B",
              code: undefined,
              type: undefined,
            },
            city: {
              name: "City B",
              code: "B1",
              image: undefined,
            },
            country: {
              name: "Country B",
              code: "B",
            },
            continent: undefined,
            terminal: {
              name: "Terminal 2",
              type: "International",
            },
          },
          isActive: true,
          baggage: undefined,
          cabinBaggage: undefined,
          entertainment: undefined,
          price: 500,
          totalPrice: 500,
          totalSeats: 1,
          occupiedSeats: 0,
          availableSeats: 1,
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);
      prismaMock.flight.count.mockResolvedValue(1);

      const searchParams = {
        page: 1,
        limit: 10,
        search: {},
        orderBy: "departure_late",
      };
      const result = await flightService.getAll(searchParams);

      // Convert Date objects to ISO string if they are Date objects
      result.formattedFlights.forEach((flight) => {
        flight.departure.time = flight.departure.time.toISOString();
        flight.arrival.time = flight.arrival.time.toISOString();
      });

      expect(result.formattedFlights).toEqual(expectedResponse);
      expect(result.pagination.totalItems).toBe(1);
    });

    it("should return a paginated list of flights (arrival_soon)", async () => {
      const flights = [
        {
          id: 1,
          price: 500,
          duration: 150,
          isActive: true,
          Seat: [{ isOccupied: false }],
          Route: {
            DepartureAirport: {
              name: "Airport A",
              City: {
                name: "City A",
                code: "A1",
                country: "Country A",
                countryCode: "A",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              City: {
                name: "City B",
                code: "B1",
                country: "Country B",
                countryCode: "B",
              },
            },
          },
          Airplane: { name: "Airplane A", Airline: { name: "Airline A" } },
          departureTime: new Date("2023-12-11T10:00:00Z"),
          arrivalTime: new Date("2023-12-11T12:30:00Z"),
          DepartureTerminal: { name: "Terminal 1", type: "Domestic" },
          ArrivalTerminal: { name: "Terminal 2", type: "International" },
        },
      ];

      const expectedResponse = [
        {
          id: 1,
          class: undefined,
          airline: "Airline A",
          airplane: "Airplane A",
          duration: 150,
          departure: {
            time: "2023-12-11T10:00:00.000Z",
            airport: {
              name: "Airport A",
              code: undefined,
              type: undefined,
            },
            city: {
              name: "City A",
              code: "A1",
              image: undefined,
            },
            country: {
              name: "Country A",
              code: "A",
            },
            terminal: {
              name: "Terminal 1",
              type: "Domestic",
            },
          },
          arrival: {
            time: "2023-12-11T12:30:00.000Z",
            airport: {
              name: "Airport B",
              code: undefined,
              type: undefined,
            },
            city: {
              name: "City B",
              code: "B1",
              image: undefined,
            },
            country: {
              name: "Country B",
              code: "B",
            },
            continent: undefined,
            terminal: {
              name: "Terminal 2",
              type: "International",
            },
          },
          isActive: true,
          baggage: undefined,
          cabinBaggage: undefined,
          entertainment: undefined,
          price: 500,
          totalPrice: 500,
          totalSeats: 1,
          occupiedSeats: 0,
          availableSeats: 1,
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);
      prismaMock.flight.count.mockResolvedValue(1);

      const searchParams = {
        page: 1,
        limit: 10,
        search: {},
        orderBy: "arrival_soon",
      };
      const result = await flightService.getAll(searchParams);

      // Convert Date objects to ISO string if they are Date objects
      result.formattedFlights.forEach((flight) => {
        flight.departure.time = flight.departure.time.toISOString();
        flight.arrival.time = flight.arrival.time.toISOString();
      });

      expect(result.formattedFlights).toEqual(expectedResponse);
      expect(result.pagination.totalItems).toBe(1);
    });

    it("should return a paginated list of flights (arrival_late)", async () => {
      const flights = [
        {
          id: 1,
          price: 500,
          duration: 150,
          isActive: true,
          Seat: [{ isOccupied: false }],
          Route: {
            DepartureAirport: {
              name: "Airport A",
              City: {
                name: "City A",
                code: "A1",
                country: "Country A",
                countryCode: "A",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              City: {
                name: "City B",
                code: "B1",
                country: "Country B",
                countryCode: "B",
              },
            },
          },
          Airplane: { name: "Airplane A", Airline: { name: "Airline A" } },
          departureTime: new Date("2023-12-11T10:00:00Z"),
          arrivalTime: new Date("2023-12-11T12:30:00Z"),
          DepartureTerminal: { name: "Terminal 1", type: "Domestic" },
          ArrivalTerminal: { name: "Terminal 2", type: "International" },
        },
      ];

      const expectedResponse = [
        {
          id: 1,
          class: undefined,
          airline: "Airline A",
          airplane: "Airplane A",
          duration: 150,
          departure: {
            time: "2023-12-11T10:00:00.000Z",
            airport: {
              name: "Airport A",
              code: undefined,
              type: undefined,
            },
            city: {
              name: "City A",
              code: "A1",
              image: undefined,
            },
            country: {
              name: "Country A",
              code: "A",
            },
            terminal: {
              name: "Terminal 1",
              type: "Domestic",
            },
          },
          arrival: {
            time: "2023-12-11T12:30:00.000Z",
            airport: {
              name: "Airport B",
              code: undefined,
              type: undefined,
            },
            city: {
              name: "City B",
              code: "B1",
              image: undefined,
            },
            country: {
              name: "Country B",
              code: "B",
            },
            continent: undefined,
            terminal: {
              name: "Terminal 2",
              type: "International",
            },
          },
          isActive: true,
          baggage: undefined,
          cabinBaggage: undefined,
          entertainment: undefined,
          price: 500,
          totalPrice: 500,
          totalSeats: 1,
          occupiedSeats: 0,
          availableSeats: 1,
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);
      prismaMock.flight.count.mockResolvedValue(1);

      const searchParams = {
        page: 1,
        limit: 10,
        search: {},
        orderBy: "arrival_late",
      };
      const result = await flightService.getAll(searchParams);

      // Convert Date objects to ISO string if they are Date objects
      result.formattedFlights.forEach((flight) => {
        flight.departure.time = flight.departure.time.toISOString();
        flight.arrival.time = flight.arrival.time.toISOString();
      });

      expect(result.formattedFlights).toEqual(expectedResponse);
      expect(result.pagination.totalItems).toBe(1);
    });

    it("should throw an error if no flights are found", async () => {
      prismaMock.flight.findMany.mockResolvedValue([]);

      await expect(flightService.getAll({})).rejects.toThrow(AppError);

      expect(console.error).toHaveBeenCalledWith(
        "Error getting flight data:",
        expect.any(Error)
      );
    });
  });

  describe("getById", () => {
    it("should return flight details by ID", async () => {
      const flight = {
        id: 1,
        price: 500,
        Seat: [{ isOccupied: false }],
        Route: {
          DepartureAirport: { name: "Airport A", City: { name: "City A" } },
          ArrivalAirport: { name: "Airport B", City: { name: "City B" } },
        },
        Airplane: { name: "Airplane A", Airline: { name: "Airline A" } },
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        DepartureTerminal: { name: "Terminal 1", type: "Domestic" }, // Mocked DepartureTerminal
        ArrivalTerminal: { name: "Terminal 2", type: "International" }, // Mocked ArrivalTerminal
        isActive: true,
        baggage: undefined,
        cabinBaggage: undefined,
        entertainment: undefined,
        class: undefined,
      };

      // Format the expected response based on the actual function's output structure
      const expectedResponse = {
        id: 1,
        class: undefined,
        airline: "Airline A",
        airplane: "Airplane A",
        departure: {
          time: "2023-12-11T10:00:00.000Z",
          airport: {
            name: "Airport A",
            code: undefined, // No code in the mock
            type: undefined, // No type in the mock
          },
          city: {
            name: "City A",
            code: undefined, // No code in the mock
            image: undefined, // No image in the mock
          },
          country: {
            name: undefined, // No country in the mock
            code: undefined, // No country code in the mock
          },
          terminal: {
            name: "Terminal 1",
            type: "Domestic",
          },
        },
        arrival: {
          time: "2023-12-11T12:30:00.000Z",
          airport: {
            name: "Airport B",
            code: undefined, // No code in the mock
            type: undefined, // No type in the mock
          },
          city: {
            name: "City B",
            code: undefined, // No code in the mock
            image: undefined, // No image in the mock
          },
          country: {
            name: undefined, // No country in the mock
            code: undefined, // No country code in the mock
          },
          terminal: {
            name: "Terminal 2",
            type: "International",
          },
        },
        Seat: [{ isOccupied: false }],
        isActive: true,
        baggage: undefined,
        cabinBaggage: undefined,
        entertainment: undefined,
        price: 500,
        totalPrice: 500,
        totalSeats: 1,
        occupiedSeats: 0,
        availableSeats: 1,
      };

      prismaMock.flight.findUnique.mockResolvedValue(flight);

      const result = await flightService.getById(1);

      // Convert Date objects to ISO string if they are Date objects
      result.departure.time = result.departure.time.toISOString();
      result.arrival.time = result.arrival.time.toISOString();

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if flight is not found", async () => {
      prismaMock.flight.findUnique.mockResolvedValue(null);

      await expect(flightService.getById(999)).rejects.toThrow(AppError);

      // Correct the error message comparison
      expect(console.error).toHaveBeenCalledWith(
        "Error getting flight data:",
        expect.any(Error)
      );
    });
  });

  describe("store", () => {
    it("should create a flight successfully", async () => {
      const payload = {
        routeId: 1,
        class: "Economy",
        airplaneId: 1,
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        departureTerminalId: 1,
        arrivalTerminalId: 2,
      };

      const newFlight = {
        id: 1,
        price: 500,
        airplaneId: 1,
        arrivalTerminalId: 2,
        departureTerminalId: 1,
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        departureTime: new Date("2023-12-11T10:00:00Z"),
        capacity: 72,
        class: "Economy",
        duration: 150,
        routeId: payload.routeId,
        isActive: true,
        Seat: {
          create: Array.from({ length: 72 }, (_, index) => ({
            seatNumber: index + 1,
            isOccupied: false,
          })),
        },
        Ticket: {
          create: {
            routeId: 1,
            class: "Economy",
            isTransits: false,
            departureTime: new Date("2023-12-11T10:00:00Z"),
            arrivalTime: new Date("2023-12-11T12:30:00Z"),
            totalPrice: 500,
            discountPrice: null,
            totalDuration: 150,
            discountId: null,
          },
        },
      };

      prismaMock.flight.create.mockResolvedValue(newFlight);
      prismaMock.route.findUnique.mockResolvedValue({ distance: 1000 });
      prismaMock.airplane.findUnique.mockResolvedValue({ pricePerKm: 0.5 });
      prismaMock.terminal.findUnique
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 });

      const result = await flightService.store(payload);

      expect(result).toEqual(newFlight);

      // Adjust the test to match the actual dynamic data, including the `include` field
      expect(prismaMock.flight.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          routeId: payload.routeId,
          class: payload.class,
          departureTime: payload.departureTime,
          arrivalTime: payload.arrivalTime,
          Seat: expect.objectContaining({
            create: expect.arrayContaining(
              Array.from({ length: 72 }, (_, index) => ({
                seatNumber: index + 1,
                isOccupied: false,
              }))
            ),
          }),
          Ticket: expect.objectContaining({
            create: expect.objectContaining({
              routeId: payload.routeId,
              class: payload.class,
              departureTime: payload.departureTime,
              arrivalTime: payload.arrivalTime,
              totalPrice: 500,
              discountPrice: null,
              totalDuration: 150,
              discountId: null,
            }),
          }),
          airplaneId: 1,
          arrivalTerminalId: 2,
          departureTerminalId: 1,
          capacity: 72,
          isActive: true,
          price: 500,
          duration: 150,
          baggage: undefined,
          cabinBaggage: undefined,
          entertainment: undefined,
        }),
        include: expect.objectContaining({
          Ticket: true,
        }),
      });
    });

    it("should throw an error if departure time is after arrival time", async () => {
      const payload = {
        departureTime: new Date("2023-12-11T13:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
      };

      await expect(flightService.store(payload)).rejects.toThrow(AppError);

      // Check if console.error was called
      expect(console.error).toHaveBeenCalledWith(
        "Error creating flight:",
        expect.any(Error)
      );
    });

    it("should throw an error if the route is not found", async () => {
      const payload = {
        routeId: 1,
        class: "Economy",
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        airplaneId: 1,
        departureTerminalId: 1,
        arrivalTerminalId: 2,
      };

      prismaMock.route.findUnique.mockResolvedValue(null);

      await expect(flightService.store(payload)).rejects.toThrow(AppError);
    });

    it("should throw an error if the airplane is not found", async () => {
      const payload = {
        routeId: 1,
        class: "Economy",
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        airplaneId: 1,
        departureTerminalId: 1,
        arrivalTerminalId: 2,
      };

      prismaMock.route.findUnique.mockResolvedValue({ distance: 1000 });
      prismaMock.airplane.findUnique.mockResolvedValue(null);

      await expect(flightService.store(payload)).rejects.toThrow(AppError);

      // Check if console.error was called
      expect(console.error).toHaveBeenCalledWith(
        "Error creating flight:",
        expect.any(Error)
      );
    });

    it("should throw an error if the departure terminal is not found", async () => {
      const payload = {
        routeId: 1,
        class: "Economy",
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        airplaneId: 1,
        departureTerminalId: 1,
        arrivalTerminalId: 2,
      };

      prismaMock.route.findUnique.mockResolvedValue({ distance: 1000 });
      prismaMock.airplane.findUnique.mockResolvedValue({ pricePerKm: 0.5 });
      prismaMock.terminal.findUnique.mockResolvedValueOnce(null);

      await expect(flightService.store(payload)).rejects.toThrow(AppError);

      // Check if console.error was called
      expect(console.error).toHaveBeenCalledWith(
        "Error creating flight:",
        expect.any(Error)
      );
    });

    it("should throw an error if the arrival terminal is not found", async () => {
      const payload = {
        routeId: 1,
        class: "Economy",
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        airplaneId: 1,
        departureTerminalId: 1,
        arrivalTerminalId: 2,
      };

      prismaMock.route.findUnique.mockResolvedValue({ distance: 1000 });
      prismaMock.airplane.findUnique.mockResolvedValue({ pricePerKm: 0.5 });
      prismaMock.terminal.findUnique
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce(null);

      await expect(flightService.store(payload)).rejects.toThrow(AppError);

      // Check if console.error was called
      expect(console.error).toHaveBeenCalledWith(
        "Error creating flight:",
        expect.any(Error)
      );
    });

    it("should throw an error if the discount is not found", async () => {
      const payload = {
        routeId: 1,
        class: "Economy",
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        airplaneId: 1,
        departureTerminalId: 1,
        arrivalTerminalId: 2,
        discountId: 999,
      };

      prismaMock.route.findUnique.mockResolvedValue({ distance: 1000 });
      prismaMock.airplane.findUnique.mockResolvedValue({ pricePerKm: 0.5 });
      prismaMock.terminal.findUnique
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 });
      prismaMock.discount.findUnique.mockResolvedValue(null);

      await expect(flightService.store(payload)).rejects.toThrow(AppError);

      // Check if console.error was called
      expect(console.error).toHaveBeenCalledWith(
        "Error creating flight:",
        expect.any(Error)
      );
    });
  });

  describe("update", () => {
    it("should update flight details successfully", async () => {
      const payload = { isActive: true };
      const existingFlight = {
        id: 1,
        isActive: false,
        routeId: 1,
        class: "Economy",
        airplaneId: 1,
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        duration: 150,
        baggage: undefined,
        cabinBaggage: undefined,
        entertainment: undefined,
        departureTerminalId: 1,
        arrivalTerminalId: 2,
        discountId: null,
      };

      const updatedFlight = {
        ...existingFlight,
        ...payload,
        isActive: true,
      };

      // Mock the necessary data for the update process
      prismaMock.flight.findUnique.mockResolvedValue(existingFlight);
      prismaMock.flight.update.mockResolvedValue(updatedFlight);
      prismaMock.route.findUnique.mockResolvedValue({ id: 1 }); // Mock route existence
      prismaMock.airplane.findUnique.mockResolvedValue({ id: 1 }); // Mock airplane existence
      prismaMock.terminal.findUnique
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 }); // Mock terminal existence

      // Run the update function
      const result = await flightService.update(payload, 1);

      // Check that the result is the updated flight
      expect(result).toEqual(updatedFlight);

      // Ensure the update function was called correctly
      expect(prismaMock.flight.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      // Ensure the flight update includes all necessary fields
      expect(prismaMock.flight.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          isActive: true,
          routeId: 1,
          class: "Economy",
          airplaneId: 1,
          departureTime: new Date("2023-12-11T10:00:00Z"),
          arrivalTime: new Date("2023-12-11T12:30:00Z"),
          duration: 150,
          baggage: undefined,
          cabinBaggage: undefined,
          entertainment: undefined,
          departureTerminalId: 1,
          arrivalTerminalId: 2,
          discountId: null,
        },
      });
    });

    it("should throw an error if flight is not found", async () => {
      prismaMock.flight.findUnique.mockResolvedValue(null);

      // Mock the console.error to track error output
      console.error = jest.fn();

      await expect(flightService.update({}, 999)).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error updating flight:",
        expect.any(Error)
      );
    });

    it("should throw an error if departure time is after arrival time", async () => {
      const payload = {
        departureTime: new Date("2023-12-11T13:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
      };

      const existingFlight = {
        id: 1,
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
      };

      prismaMock.flight.findUnique.mockResolvedValue(existingFlight);

      await expect(flightService.update(payload, 1)).rejects.toThrow(AppError);

      // Check if console.error was called
      expect(console.error).toHaveBeenCalledWith(
        "Error updating flight:",
        expect.any(Error)
      );
    });

    it("should throw an error if route is not found", async () => {
      const payload = { routeId: 999 };
      const existingFlight = { id: 1, routeId: 1 };

      prismaMock.flight.findUnique.mockResolvedValue(existingFlight);
      prismaMock.route.findUnique.mockResolvedValue(null);

      await expect(flightService.update(payload, 1)).rejects.toThrow(AppError);

      // Check if console.error was called
      expect(console.error).toHaveBeenCalledWith(
        "Error updating flight:",
        expect.any(Error)
      );
    });

    it("should throw an error if airplane is not found", async () => {
      const payload = { airplaneId: 999 };
      const existingFlight = { id: 1, airplaneId: 1 };
      const existingRoute = { id: 1 };

      prismaMock.flight.findUnique.mockResolvedValue(existingFlight);
      prismaMock.route.findUnique.mockResolvedValue(existingRoute);
      prismaMock.airplane.findUnique.mockResolvedValue(null);

      await expect(flightService.update(payload, 1)).rejects.toThrow(AppError);

      // Check if console.error was called
      expect(console.error).toHaveBeenCalledWith(
        "Error updating flight:",
        expect.any(Error)
      );
    });

    it("should throw an error if departure terminal is not found", async () => {
      const payload = { departureTerminalId: 999 };
      const existingFlight = { id: 1, departureTerminalId: 1 };
      const existingRoute = { id: 1 };
      const existingAirplane = { id: 1 };

      prismaMock.flight.findUnique.mockResolvedValue(existingFlight);
      prismaMock.route.findUnique.mockResolvedValue(existingRoute);
      prismaMock.airplane.findUnique.mockResolvedValue(existingAirplane);
      prismaMock.terminal.findUnique.mockResolvedValueOnce(null);

      await expect(flightService.update(payload, 1)).rejects.toThrow(AppError);

      // Check if console.error was called
      expect(console.error).toHaveBeenCalledWith(
        "Error updating flight:",
        expect.any(Error)
      );
    });

    it("should throw an error if arrival terminal is not found", async () => {
      const payload = { arrivalTerminalId: 999 };
      const existingFlight = { id: 1, arrivalTerminalId: 2 };
      const existingRoute = { id: 1 };
      const existingAirplane = { id: 1 };
      const existingDepartureTerminal = { id: 1 };

      prismaMock.flight.findUnique.mockResolvedValue(existingFlight);
      prismaMock.route.findUnique.mockResolvedValue(existingRoute);
      prismaMock.airplane.findUnique.mockResolvedValue(existingAirplane);

      prismaMock.terminal.findUnique
        .mockResolvedValueOnce(existingDepartureTerminal) // Mock departure terminal existence
        .mockResolvedValueOnce(null); // Mock missing arrival terminal

      await expect(flightService.update(payload, 1)).rejects.toThrow(AppError);

      // Check if console.error was called
      expect(console.error).toHaveBeenCalledWith(
        "Error updating flight:",
        expect.any(Error)
      );
    });
  });

  describe("destroy", () => {
    it("should delete a flight successfully", async () => {
      const flight = { id: 1 };

      prismaMock.flight.findUnique.mockResolvedValue(flight);
      prismaMock.flight.delete.mockResolvedValue(flight);

      const result = await flightService.destroy(1);

      expect(result).toEqual({
        message: "Flight deleted successfully",
      });
      expect(prismaMock.flight.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw an error if flight is not found", async () => {
      prismaMock.flight.findUnique.mockResolvedValue(null);

      await expect(flightService.destroy(999)).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error deleting flight:",
        expect.any(Error)
      );
    });
  });
});
