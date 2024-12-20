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
    it("should return a paginated list of flights (default)", async () => {
      const flights = [
        {
          id: 1,
          price: 500,
          duration: 150,
          isActive: true,
          Seat: [{ isOccupied: false }],
          _count: { Ticket: 5 },
          Route: {
            DepartureAirport: {
              name: "Airport A",
              iataCode: "AIA",
              type: "International",
              City: {
                name: "City A",
                code: "A1",
                imageUrl: "cityA.jpg",
                country: "Country A",
                countryCode: "A",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              iataCode: "BIA",
              type: "Domestic",
              City: {
                name: "City B",
                code: "B1",
                imageUrl: "cityB.jpg",
                country: "Country B",
                countryCode: "B",
                continent: "Europe",
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
          airline: { iataCode: undefined, imageUrl: undefined, name: "Airline A" },
          airplane: "Airplane A",
          duration: 150,
          departure: {
            time: "2023-12-11T10:00:00.000Z",
            airport: {
              name: "Airport A",
              code: "AIA",
              type: "International",
            },
            city: {
              name: "City A",
              code: "A1",
              image: "cityA.jpg",
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
              code: "BIA",
              type: "Domestic",
            },
            city: {
              name: "City B",
              code: "B1",
              image: "cityB.jpg",
            },
            country: {
              name: "Country B",
              code: "B",
            },
            continent: "Europe",
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
          totalTickets: 5,
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

      // Convert Date objects to ISO strings for comparison
      result.formattedFlights.forEach((flight) => {
        flight.departure.time = flight.departure.time.toISOString();
        flight.arrival.time = flight.arrival.time.toISOString();
      });

      expect(result.formattedFlights).toEqual(expectedResponse);
      expect(result.pagination.totalItems).toBe(1);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
    });

    it("should return a paginated list of flights (price_asc)", async () => {
      const flights = [
        {
          id: 1,
          price: 500,
          duration: 150,
          isActive: true,
          Seat: [{ isOccupied: false }],
          _count: { Ticket: 5 },
          Route: {
            DepartureAirport: {
              name: "Airport A",
              iataCode: "AIA",
              type: "International",
              City: {
                name: "City A",
                code: "A1",
                imageUrl: "cityA.jpg",
                country: "Country A",
                countryCode: "A",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              iataCode: "BIA",
              type: "Domestic",
              City: {
                name: "City B",
                code: "B1",
                imageUrl: "cityB.jpg",
                country: "Country B",
                countryCode: "B",
                continent: "Europe",
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
          airline: { iataCode: undefined, imageUrl: undefined, name: "Airline A" },
          airplane: "Airplane A",
          duration: 150,
          departure: {
            time: "2023-12-11T10:00:00.000Z",
            airport: {
              name: "Airport A",
              code: "AIA",
              type: "International",
            },
            city: {
              name: "City A",
              code: "A1",
              image: "cityA.jpg",
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
              code: "BIA",
              type: "Domestic",
            },
            city: {
              name: "City B",
              code: "B1",
              image: "cityB.jpg",
            },
            country: {
              name: "Country B",
              code: "B",
            },
            continent: "Europe",
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
          totalTickets: 5,
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

      // Convert Date objects to ISO strings for comparison
      result.formattedFlights.forEach((flight) => {
        flight.departure.time = flight.departure.time.toISOString();
        flight.arrival.time = flight.arrival.time.toISOString();
      });

      expect(result.formattedFlights).toEqual(expectedResponse);
      expect(result.pagination.totalItems).toBe(1);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
    });

    it("should return a paginated list of flights (departure_soon)", async () => {
      const flights = [
        {
          id: 1,
          price: 500,
          duration: 150,
          isActive: true,
          Seat: [{ isOccupied: false }],
          _count: { Ticket: 5 },
          Route: {
            DepartureAirport: {
              name: "Airport A",
              iataCode: "AIA",
              type: "International",
              City: {
                name: "City A",
                code: "A1",
                imageUrl: "cityA.jpg",
                country: "Country A",
                countryCode: "A",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              iataCode: "BIA",
              type: "Domestic",
              City: {
                name: "City B",
                code: "B1",
                imageUrl: "cityB.jpg",
                country: "Country B",
                countryCode: "B",
                continent: "Europe",
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
          airline: { iataCode: undefined, imageUrl: undefined, name: "Airline A" },
          airplane: "Airplane A",
          duration: 150,
          departure: {
            time: "2023-12-11T10:00:00.000Z",
            airport: {
              name: "Airport A",
              code: "AIA",
              type: "International",
            },
            city: {
              name: "City A",
              code: "A1",
              image: "cityA.jpg",
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
              code: "BIA",
              type: "Domestic",
            },
            city: {
              name: "City B",
              code: "B1",
              image: "cityB.jpg",
            },
            country: {
              name: "Country B",
              code: "B",
            },
            continent: "Europe",
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
          totalTickets: 5,
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

      // Convert Date objects to ISO strings for comparison
      result.formattedFlights.forEach((flight) => {
        flight.departure.time = flight.departure.time.toISOString();
        flight.arrival.time = flight.arrival.time.toISOString();
      });

      expect(result.formattedFlights).toEqual(expectedResponse);
      expect(result.pagination.totalItems).toBe(1);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
    });

    it("should return a paginated list of flights (departure_late)", async () => {
      const flights = [
        {
          id: 1,
          price: 500,
          duration: 150,
          isActive: true,
          Seat: [{ isOccupied: false }],
          _count: { Ticket: 5 },
          Route: {
            DepartureAirport: {
              name: "Airport A",
              iataCode: "AIA",
              type: "International",
              City: {
                name: "City A",
                code: "A1",
                imageUrl: "cityA.jpg",
                country: "Country A",
                countryCode: "A",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              iataCode: "BIA",
              type: "Domestic",
              City: {
                name: "City B",
                code: "B1",
                imageUrl: "cityB.jpg",
                country: "Country B",
                countryCode: "B",
                continent: "Europe",
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
          airline: { iataCode: undefined, imageUrl: undefined, name: "Airline A" },
          airplane: "Airplane A",
          duration: 150,
          departure: {
            time: "2023-12-11T10:00:00.000Z",
            airport: {
              name: "Airport A",
              code: "AIA",
              type: "International",
            },
            city: {
              name: "City A",
              code: "A1",
              image: "cityA.jpg",
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
              code: "BIA",
              type: "Domestic",
            },
            city: {
              name: "City B",
              code: "B1",
              image: "cityB.jpg",
            },
            country: {
              name: "Country B",
              code: "B",
            },
            continent: "Europe",
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
          totalTickets: 5,
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

      // Convert Date objects to ISO strings for comparison
      result.formattedFlights.forEach((flight) => {
        flight.departure.time = flight.departure.time.toISOString();
        flight.arrival.time = flight.arrival.time.toISOString();
      });

      expect(result.formattedFlights).toEqual(expectedResponse);
      expect(result.pagination.totalItems).toBe(1);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
    });

    it("should return a paginated list of flights (arrival_soon)", async () => {
      const flights = [
        {
          id: 1,
          price: 500,
          duration: 150,
          isActive: true,
          Seat: [{ isOccupied: false }],
          _count: { Ticket: 5 },
          Route: {
            DepartureAirport: {
              name: "Airport A",
              iataCode: "AIA",
              type: "International",
              City: {
                name: "City A",
                code: "A1",
                imageUrl: "cityA.jpg",
                country: "Country A",
                countryCode: "A",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              iataCode: "BIA",
              type: "Domestic",
              City: {
                name: "City B",
                code: "B1",
                imageUrl: "cityB.jpg",
                country: "Country B",
                countryCode: "B",
                continent: "Europe",
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
          airline: { iataCode: undefined, imageUrl: undefined, name: "Airline A" },
          airplane: "Airplane A",
          duration: 150,
          departure: {
            time: "2023-12-11T10:00:00.000Z",
            airport: {
              name: "Airport A",
              code: "AIA",
              type: "International",
            },
            city: {
              name: "City A",
              code: "A1",
              image: "cityA.jpg",
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
              code: "BIA",
              type: "Domestic",
            },
            city: {
              name: "City B",
              code: "B1",
              image: "cityB.jpg",
            },
            country: {
              name: "Country B",
              code: "B",
            },
            continent: "Europe",
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
          totalTickets: 5,
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

      // Convert Date objects to ISO strings for comparison
      result.formattedFlights.forEach((flight) => {
        flight.departure.time = flight.departure.time.toISOString();
        flight.arrival.time = flight.arrival.time.toISOString();
      });

      expect(result.formattedFlights).toEqual(expectedResponse);
      expect(result.pagination.totalItems).toBe(1);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
    });

    it("should return a paginated list of flights (arrival_late)", async () => {
      const flights = [
        {
          id: 1,
          price: 500,
          duration: 150,
          isActive: true,
          Seat: [{ isOccupied: false }],
          _count: { Ticket: 5 },
          Route: {
            DepartureAirport: {
              name: "Airport A",
              iataCode: "AIA",
              type: "International",
              City: {
                name: "City A",
                code: "A1",
                imageUrl: "cityA.jpg",
                country: "Country A",
                countryCode: "A",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              iataCode: "BIA",
              type: "Domestic",
              City: {
                name: "City B",
                code: "B1",
                imageUrl: "cityB.jpg",
                country: "Country B",
                countryCode: "B",
                continent: "Europe",
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
          airline: { iataCode: undefined, imageUrl: undefined, name: "Airline A" },
          airplane: "Airplane A",
          duration: 150,
          departure: {
            time: "2023-12-11T10:00:00.000Z",
            airport: {
              name: "Airport A",
              code: "AIA",
              type: "International",
            },
            city: {
              name: "City A",
              code: "A1",
              image: "cityA.jpg",
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
              code: "BIA",
              type: "Domestic",
            },
            city: {
              name: "City B",
              code: "B1",
              image: "cityB.jpg",
            },
            country: {
              name: "Country B",
              code: "B",
            },
            continent: "Europe",
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
          totalTickets: 5,
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

      // Convert Date objects to ISO strings for comparison
      result.formattedFlights.forEach((flight) => {
        flight.departure.time = flight.departure.time.toISOString();
        flight.arrival.time = flight.arrival.time.toISOString();
      });

      expect(result.formattedFlights).toEqual(expectedResponse);
      expect(result.pagination.totalItems).toBe(1);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
    });

    it("should apply search filters and return filtered flights", async () => {
      const flights = [
        {
          id: 2,
          price: 600,
          duration: 200,
          isActive: true,
          Seat: [{ isOccupied: true }],
          _count: { Ticket: 3 },
          Route: {
            DepartureAirport: {
              name: "Airport X",
              iataCode: "XIA",
              type: "Domestic",
              City: {
                name: "City X",
                code: "X1",
                imageUrl: "cityX.jpg",
                country: "Country X",
                countryCode: "X",
              },
            },
            ArrivalAirport: {
              name: "Airport Y",
              iataCode: "YIA",
              type: "International",
              City: {
                name: "City Y",
                code: "Y1",
                imageUrl: "cityY.jpg",
                country: "Country Y",
                countryCode: "Y",
                continent: "Asia",
              },
            },
          },
          Airplane: { name: "Airplane B", Airline: { name: "Airline B" } },
          departureTime: new Date("2023-12-12T15:00:00Z"),
          arrivalTime: new Date("2023-12-12T18:00:00Z"),
          DepartureTerminal: { name: "Terminal A", type: "Domestic" },
          ArrivalTerminal: { name: "Terminal B", type: "International" },
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);
      prismaMock.flight.count.mockResolvedValue(1);

      const searchParams = {
        page: 1,
        limit: 5,
        search: { departureCity: "City X", arrivalCity: "City Y" },
        orderBy: "duration_asc",
      };

      const result = await flightService.getAll(searchParams);

      // Verify results
      expect(result.formattedFlights.length).toBe(1);
      expect(result.pagination.totalItems).toBe(1);
      expect(result.pagination.pageSize).toBe(5);
      expect(prismaMock.flight.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.any(Array),
          }),
        })
      );
    });

    it("should throw an error if fetching flights fails", async () => {
      prismaMock.flight.findMany.mockRejectedValue(
        new AppError("Database Error")
      );

      await expect(flightService.getAll({})).rejects.toThrow(AppError);

      expect(console.error).toHaveBeenCalledWith(
        "Error getting flight data:",
        expect.any(AppError)
      );
    });
  });

  describe("getById", () => {
    it("should return flight details by ID", async () => {
      const flight = {
        id: 1,
        price: 500,
        Seat: [{ isOccupied: false }],
        Ticket: [{ id: 1 }],
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
        airline: { iataCode: undefined, imageUrl: undefined, name: "Airline A" },
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
        totalTickets: 1,
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
    it("should create flights successfully for multiple class types", async () => {
      const payload = {
        routeId: 1,
        class: ["Economy", "Business"], // Multiple class types
        airplaneId: 1,
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        departureTerminalId: 1,
        arrivalTerminalId: 2,
      };

      const newFlightEconomy = {
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
            totalPrice: 500, // Corrected
            totalDuration: 150,
            discountId: null,
          },
        },
      };

      const newFlightBusiness = {
        id: 2,
        price: 1500,
        airplaneId: 1,
        arrivalTerminalId: 2,
        departureTerminalId: 1,
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        departureTime: new Date("2023-12-11T10:00:00Z"),
        capacity: 30,
        class: "Business",
        duration: 150,
        routeId: payload.routeId,
        isActive: true,
        Seat: {
          create: Array.from({ length: 30 }, (_, index) => ({
            seatNumber: index + 1,
            isOccupied: false,
          })),
        },
        Ticket: {
          create: {
            routeId: 1,
            class: "Business",
            isTransits: false,
            departureTime: new Date("2023-12-11T10:00:00Z"),
            arrivalTime: new Date("2023-12-11T12:30:00Z"),
            totalPrice: 1500, // Corrected
            totalDuration: 150,
            discountId: null,
          },
        },
      };

      prismaMock.flight.create.mockResolvedValueOnce(newFlightEconomy);
      prismaMock.flight.create.mockResolvedValueOnce(newFlightBusiness);
      prismaMock.route.findUnique.mockResolvedValue({ distance: 1000 });
      prismaMock.airplane.findUnique.mockResolvedValue({ pricePerKm: 0.5 });
      prismaMock.terminal.findUnique
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 });

      const result = await flightService.store(payload);

      expect(result).toEqual([newFlightEconomy, newFlightBusiness]);
      expect(prismaMock.flight.create).toHaveBeenCalledTimes(2);
    });

    it("should throw an error if departure time is after arrival time", async () => {
      const payload = {
        routeId: 1,
        class: ["Economy"],
        airplaneId: 1,
        departureTime: new Date("2023-12-11T13:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        departureTerminalId: 1,
        arrivalTerminalId: 2,
      };

      await expect(flightService.store(payload)).rejects.toThrow(
        "Departure time must be earlier than arrival time"
      );
    });

    it("should throw an error if the route is not found", async () => {
      const payload = {
        routeId: 999,
        class: ["Economy"],
        airplaneId: 1,
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        departureTerminalId: 1,
        arrivalTerminalId: 2,
      };

      prismaMock.route.findUnique.mockResolvedValue(null);

      await expect(flightService.store(payload)).rejects.toThrow(
        "Route not found"
      );
    });

    it("should throw an error if the airplane is not found", async () => {
      const payload = {
        routeId: 1,
        class: ["Economy"],
        airplaneId: 999,
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        departureTerminalId: 1,
        arrivalTerminalId: 2,
      };

      prismaMock.route.findUnique.mockResolvedValue({ distance: 1000 });
      prismaMock.airplane.findUnique.mockResolvedValue(null);

      await expect(flightService.store(payload)).rejects.toThrow(
        "Airplane not found"
      );
    });

    it("should throw an error if the departure terminal is not found", async () => {
      const payload = {
        routeId: 1,
        class: ["Economy"],
        airplaneId: 1,
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        departureTerminalId: 999,
        arrivalTerminalId: 2,
      };

      prismaMock.route.findUnique.mockResolvedValue({ distance: 1000 });
      prismaMock.airplane.findUnique.mockResolvedValue({ pricePerKm: 0.5 });
      prismaMock.terminal.findUnique.mockResolvedValueOnce(null);

      await expect(flightService.store(payload)).rejects.toThrow(
        "Departure terminal not found"
      );
    });

    it("should throw an error if the arrival terminal is not found", async () => {
      const payload = {
        routeId: 1,
        class: ["Economy"],
        airplaneId: 1,
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        departureTerminalId: 1,
        arrivalTerminalId: 999,
      };

      prismaMock.route.findUnique.mockResolvedValue({ distance: 1000 });
      prismaMock.airplane.findUnique.mockResolvedValue({ pricePerKm: 0.5 });
      prismaMock.terminal.findUnique
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce(null);

      await expect(flightService.store(payload)).rejects.toThrow(
        "Arrival terminal not found"
      );
    });

    it("should throw an error if the discount is not found", async () => {
      const payload = {
        routeId: 1,
        class: ["Economy"],
        airplaneId: 1,
        departureTime: new Date("2023-12-11T10:00:00Z"),
        arrivalTime: new Date("2023-12-11T12:30:00Z"),
        departureTerminalId: 1,
        arrivalTerminalId: 2,
        discountId: 999, // Invalid discount ID
      };

      prismaMock.route.findUnique.mockResolvedValue({ distance: 1000 });
      prismaMock.airplane.findUnique.mockResolvedValue({ pricePerKm: 0.5 });
      prismaMock.terminal.findUnique
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 });
      prismaMock.discount.findUnique.mockResolvedValue(null);

      await expect(flightService.store(payload)).rejects.toThrow(
        "Discount not found"
      );
    });
  });

  describe("destroy", () => {
    it("should delete a flight and its connected tickets successfully", async () => {
      const flight = { id: 1, Ticket: [{ id: 10 }, { id: 11 }] }; // Mock flight with tickets

      prismaMock.flight.findUnique.mockResolvedValue(flight); // Mock flight exists
      prismaMock.flight.delete.mockResolvedValue(flight); // Mock flight deletion
      prismaMock.ticket.deleteMany.mockResolvedValue({ count: 2 }); // Mock ticket deletion (2 tickets deleted)

      const result = await flightService.destroy(1);

      // Check the result
      expect(result).toEqual({
        message: "Flight and connected Tickets deleted successfully",
      });

      // Ensure flight.findUnique was called with correct parameters
      expect(prismaMock.flight.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { Ticket: true },
      });

      // Ensure flight.delete was called with correct parameters
      expect(prismaMock.flight.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      // Ensure ticket.deleteMany was called with correct parameters
      expect(prismaMock.ticket.deleteMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: [10, 11], // The IDs of the connected tickets
          },
        },
      });
    });

    it("should throw an error if flight is not found", async () => {
      prismaMock.flight.findUnique.mockResolvedValue(null); // Mock no flight found

      await expect(flightService.destroy(999)).rejects.toThrow(AppError);

      expect(console.error).toHaveBeenCalledWith(
        "Error deleting flight:",
        expect.any(AppError)
      );
    });

    it("should throw an error if deleting the flight or tickets fails", async () => {
      const flight = { id: 1, Ticket: [{ id: 10 }, { id: 11 }] };

      prismaMock.flight.findUnique.mockResolvedValue(flight);
      prismaMock.flight.delete.mockRejectedValue(new Error("Database error")); // Simulate deletion error

      await expect(flightService.destroy(1)).rejects.toThrow("Database error");

      expect(console.error).toHaveBeenCalledWith(
        "Error deleting flight:",
        expect.any(Error)
      );
    });
  });
});
