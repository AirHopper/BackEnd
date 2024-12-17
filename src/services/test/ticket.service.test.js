import * as ticketService from "../../services/ticket.service";
import prismaMock from "../../utils/singleton";
import AppError from "../../utils/AppError";

describe("Ticket Service", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getAll", () => {
    it("should return tickets with pagination and default sorting", async () => {
      const tickets = [
        {
          id: 1,
          totalPrice: 100,
          departureTime: "2023-12-12T08:00:00Z",
          Route: {
            DepartureAirport: {
              name: "Airport A",
              iataCode: "AAA",
              type: "international",
              City: {
                name: "City A",
                code: "CA",
                imageUrl: "city_a.png",
                country: "Country A",
                countryCode: "CNA",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              iataCode: "BBB",
              type: "domestic",
              City: {
                name: "City B",
                code: "CB",
                imageUrl: "city_b.png",
                country: "Country B",
                countryCode: "CNB",
                continent: "Europe",
              },
            },
          },
          Flights: [],
        },
      ];
      const count = 1;

      prismaMock.ticket.findMany.mockResolvedValue(tickets);
      prismaMock.ticket.count.mockResolvedValue(count);

      const result = await ticketService.getAll({ page: 1, limit: 10 });

      expect(result.formattedTickets).toHaveLength(1);
      expect(result.formattedTickets[0]).toHaveProperty("id", 1);
      expect(result.pagination).toEqual({
        totalItems: count,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      });
    });

    it("should apply search filters correctly", async () => {
      const tickets = [
        {
          id: 1,
          totalPrice: 150,
          departureTime: "2023-12-12T10:00:00Z",
          Route: {
            DepartureAirport: {
              name: "Airport A",
              iataCode: "AAA",
              type: "international",
              City: {
                name: "City A",
                code: "CA",
                imageUrl: "city_a.png",
                country: "Country A",
                countryCode: "CNA",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              iataCode: "BBB",
              type: "domestic",
              City: {
                name: "City B",
                code: "CB",
                imageUrl: "city_b.png",
                country: "Country B",
                countryCode: "CNB",
                continent: "Europe",
              },
            },
          },
          Flights: [],
        },
      ];
      const count = 1;

      prismaMock.ticket.findMany.mockResolvedValue(tickets);
      prismaMock.ticket.count.mockResolvedValue(count);

      const result = await ticketService.getAll({
        page: 1,
        limit: 10,
        search: {
          departureCity: "City A",
          arrivalCity: "City B",
          flightDate: "2023-12-12",
        },
      });

      expect(result.formattedTickets).toHaveLength(1);
      expect(result.formattedTickets[0]).toHaveProperty(
        "departure.city.name",
        "City A"
      );
      expect(result.formattedTickets[0]).toHaveProperty(
        "arrival.city.name",
        "City B"
      );
    });

    it("should apply sorting correctly", async () => {
      const tickets = [
        {
          id: 1,
          totalPrice: 200,
          departureTime: "2023-12-12T08:00:00Z",
          Route: {
            DepartureAirport: {
              name: "Airport A",
              iataCode: "AAA",
              type: "international",
              City: {
                name: "City A",
                code: "CA",
                imageUrl: "city_a.jpg",
                country: "Country A",
                countryCode: "CA",
                continent: "Continent A",
              },
            },
            ArrivalAirport: {
              name: "Airport B",
              iataCode: "BBB",
              type: "domestic",
              City: {
                name: "City B",
                code: "CB",
                imageUrl: "city_b.jpg",
                country: "Country B",
                countryCode: "CB",
                continent: "Continent B",
              },
            },
          },
          Flights: [],
        },
        {
          id: 2,
          totalPrice: 150,
          departureTime: "2023-12-12T09:00:00Z",
          Route: {
            DepartureAirport: {
              name: "Airport C",
              iataCode: "CCC",
              type: "international",
              City: {
                name: "City C",
                code: "CC",
                imageUrl: "city_c.jpg",
                country: "Country C",
                countryCode: "CC",
                continent: "Continent C",
              },
            },
            ArrivalAirport: {
              name: "Airport D",
              iataCode: "DDD",
              type: "domestic",
              City: {
                name: "City D",
                code: "CD",
                imageUrl: "city_d.jpg",
                country: "Country D",
                countryCode: "CD",
                continent: "Continent D",
              },
            },
          },
          Flights: [],
        },
      ];
      const count = 2;

      prismaMock.ticket.findMany.mockResolvedValue(tickets);
      prismaMock.ticket.count.mockResolvedValue(count);

      const result = await ticketService.getAll({
        page: 1,
        limit: 10,
        orderBy: "price_asc",
      });

      expect(result.formattedTickets[0]).toHaveProperty("totalPrice", 200);
      expect(result.formattedTickets[1]).toHaveProperty("totalPrice", 150);
    });

    it("should handle database errors gracefully", async () => {
      prismaMock.ticket.findMany.mockRejectedValue(
        new Error("Database connection error")
      );

      const searchParams = { page: 1, limit: 10 };

      await expect(ticketService.getAll(searchParams)).rejects.toThrow(
        "Database connection error"
      );
    });
  });

  describe("getById", () => {
    it("should return a ticket by ID", async () => {
      const ticket = {
        id: 1,
        totalPrice: 100,
        departureTime: "2023-12-12T08:00:00Z",
        Route: {
          DepartureAirport: {
            name: "Airport A",
            iataCode: "AAA",
            type: "international",
            City: {
              name: "City A",
              code: "CA",
              imageUrl: "city_a.png",
              country: "Country A",
              countryCode: "CNA",
            },
          },
          ArrivalAirport: {
            name: "Airport B",
            iataCode: "BBB",
            type: "domestic",
            City: {
              name: "City B",
              code: "CB",
              imageUrl: "city_b.png",
              country: "Country B",
              countryCode: "CNB",
              continent: "Europe",
            },
          },
        },
        Flights: [],
      };

      prismaMock.ticket.findUnique.mockResolvedValue(ticket);

      const result = await ticketService.getById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.departure.airport.name).toBe("Airport A");
      expect(result.arrival.airport.name).toBe("Airport B");
    });

    it("should throw an error if ticket is not found", async () => {
      prismaMock.ticket.findUnique.mockResolvedValue(null);

      await expect(ticketService.getById(1)).rejects.toThrow(
        new AppError("Tiket not found", 404)
      );
    });
  });

  describe("store", () => {
    it("should create a ticket successfully without discount", async () => {
      // Mocking flights with Route and Departure/Arrival Airport information
      const flights = [
        {
          id: 1,
          class: "economy",
          duration: 120,
          price: "100",
          departureTime: "2023-12-12T08:00:00Z",
          arrivalTime: "2023-12-12T10:00:00Z",
          Route: {
            // Mock the Route relation
            DepartureAirport: { id: 1 }, // Departure airport id
            ArrivalAirport: { id: 2 }, // Arrival airport id
          },
        },
      ];

      // Mocking a valid route
      const route = {
        id: 1,
        DepartureAirport: { id: 1 },
        ArrivalAirport: { id: 2 },
      };

      // Mock prisma calls
      prismaMock.flight.findMany.mockResolvedValue(flights);
      prismaMock.route.findUnique.mockResolvedValue(route); // Mock the route lookup to return the route
      prismaMock.ticket.create.mockResolvedValue({ id: 1 });

      const payload = { routeId: 1, flightIds: [1] };
      const result = await ticketService.store(payload);

      expect(result.id).toBe(1);
      expect(prismaMock.ticket.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            routeId: 1,
            totalPrice: 100,
            totalDuration: 120,
            Discount: null,
          }),
        })
      );
    });

    it("should throw error when flights are not in sequential order", async () => {
      // Ensure route mock is correctly defined
      const route = {
        id: 1,
        DepartureAirport: { id: 1 },
        ArrivalAirport: { id: 2 },
      };

      prismaMock.route.findUnique.mockResolvedValue(route); // Mock the route lookup to return the route

      const flights = [
        {
          id: 1,
          class: "economy",
          duration: 120,
          price: "100",
          departureTime: "2023-12-12T08:00:00Z",
          arrivalTime: "2023-12-12T10:00:00Z",
          
        },
        {
          id: 2,
          class: "economy",
          duration: 90,
          price: "150",
          departureTime: "2023-12-12T09:00:00Z", // This is out of order
          arrivalTime: "2023-12-12T10:30:00Z",
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);

      const payload = { routeId: 1, flightIds: [1, 2] };

      await expect(ticketService.store(payload)).rejects.toThrow(
        new AppError("Flights are not in sequential order by time", 400)
      );
    });

    it("should throw error if route is not found", async () => {
      prismaMock.route.findUnique.mockResolvedValue(null);

      const payload = { routeId: 1, flightIds: [1] };

      await expect(ticketService.store(payload)).rejects.toThrow(
        new AppError("Route not found", 404)
      );
    });

    it("should throw error if discount not found", async () => {
      const route = {
        id: 1,
        DepartureAirport: { id: 1 },
        ArrivalAirport: { id: 2 },
      };
      prismaMock.route.findUnique.mockResolvedValue(route);

      const flights = [
        {
          id: 1,
          class: "economy",
          duration: 120,
          price: "100",
          departureTime: "2023-12-12T08:00:00Z",
          arrivalTime: "2023-12-12T10:00:00Z",
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);
      prismaMock.discount.findUnique.mockResolvedValue(null); // No discount found

      const payload = { routeId: 1, flightIds: [1], discountId: 1 };

      await expect(ticketService.store(payload)).rejects.toThrow(
        new AppError("Discount not found", 404)
      );
    });

    it("should throw error if class type is inconsistent across flights", async () => {
      const route = {
        id: 1,
        DepartureAirport: { id: 1 },
        ArrivalAirport: { id: 2 },
      };
      prismaMock.route.findUnique.mockResolvedValue(route);

      const flights = [
        {
          id: 1,
          class: "economy",
          duration: 120,
          price: "100",
          departureTime: "2023-12-12T08:00:00Z",
          arrivalTime: "2023-12-12T10:00:00Z",
        },
        {
          id: 2,
          class: "business", // Inconsistent class type
          duration: 90,
          price: "150",
          departureTime: "2023-12-12T12:00:00Z",
          arrivalTime: "2023-12-12T13:30:00Z",
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);

      const payload = { routeId: 1, flightIds: [1, 2] };

      await expect(ticketService.store(payload)).rejects.toThrow(
        new AppError("All flights must be of the same class type", 400)
      );
    });

    it("should throw error if flights cannot be found", async () => {
      const route = {
        id: 1,
        DepartureAirport: { id: 1 },
        ArrivalAirport: { id: 2 },
      };
      prismaMock.route.findUnique.mockResolvedValue(route); // Mock route

      prismaMock.flight.findMany.mockResolvedValue([]); // No flights found

      const payload = { routeId: 1, flightIds: [1] };

      await expect(ticketService.store(payload)).rejects.toThrow(
        new AppError("Some flights could not be found", 400)
      );
    });
  });
});
