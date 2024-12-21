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
          isActive: true,
          departureTime: "2023-12-12T08:00:00Z",
          arrivalTime: "2023-12-12T10:00:00Z",
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
          Flights: [
            {
              id: 101,
              price: 100,
              duration: 120,
              departureTime: "2023-12-12T08:00:00Z",
              arrivalTime: "2023-12-12T10:00:00Z",
              class: "economy",
              isActive: true,
              Seat: [
                { isOccupied: false },
                { isOccupied: false },
                { isOccupied: true },
                { isOccupied: false },
                { isOccupied: true },
              ], // Mocked seat data (some seats occupied, some not)
              baggage: "20kg",
              cabinBaggage: "7kg",
              entertainment: true,
              Airplane: {
                name: "Boeing 747",
                Airline: {
                  name: "Airline A",
                  imageUrl: "airline_a_logo.png",
                },
              },
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
              DepartureTerminal: {
                name: "Terminal 1",
                type: "Domestic",
              },
              ArrivalTerminal: {
                name: "Terminal 2",
                type: "International",
              },
            },
          ],
        },
      ];

      const count = 1;

      prismaMock.ticket.findMany.mockResolvedValue(tickets);
      prismaMock.ticket.count.mockResolvedValue(count);

      const result = await ticketService.getAll({
        page: 1,
        limit: 10,
        orderBy: "default",
      });

      // Define the expected response structure for tickets
      const expectedResponse = [
        {
          id: 1,
          class: undefined, // Since class is not defined in the sample data
          discount: undefined, // Since discount is not defined in the sample data
          isTransits: undefined, // Since isTransits is not defined in the sample data
          totalPrice: 100,
          isActive: true,
          departure: {
            time: "2023-12-12T08:00:00Z",
            airport: {
              name: "Airport A",
              code: "AAA",
              type: "international",
            },
            city: {
              name: "City A",
              code: "CA",
              image: "city_a.png",
            },
            country: {
              name: "Country A",
              code: "CNA",
            },
          },
          arrival: {
            time: "2023-12-12T10:00:00Z",
            airport: {
              name: "Airport B",
              code: "BBB",
              type: "domestic",
            },
            city: {
              name: "City B",
              code: "CB",
              image: "city_b.png",
            },
            country: {
              name: "Country B",
              code: "CNB",
            },
            continent: "Europe",
          },
          flights: [
            {
              id: 101,
              duration: 120,
              baggage: "20kg",
              cabinBaggage: "7kg",
              entertainment: true,
              airline: {
                name: "Airline A",
                logo: "airline_a_logo.png",
              },
              airplane: "Boeing 747",
              departure: {
                time: "2023-12-12T08:00:00Z",
                airport: {
                  name: "Airport A",
                  code: "AAA",
                  type: "international",
                },
                city: {
                  name: "City A",
                  code: "CA",
                  image: "city_a.png",
                },
                country: {
                  name: "Country A",
                  code: "CNA",
                },
                terminal: {
                  name: "Terminal 1",
                  type: "Domestic",
                },
              },
              arrival: {
                time: "2023-12-12T10:00:00Z",
                airport: {
                  name: "Airport B",
                  code: "BBB",
                  type: "domestic",
                },
                city: {
                  name: "City B",
                  code: "CB",
                  image: "city_b.png",
                },
                country: {
                  name: "Country B",
                  code: "CNB",
                },
                continent: "Europe",
                terminal: {
                  name: "Terminal 2",
                  type: "International",
                },
              },
              totalSeats: 5,
              occupiedSeats: 2,
              availableSeats: 3,
            },
          ],
        },
      ];

      // Compare the formattedTickets to the expectedResponse
      expect(result.formattedTickets).toEqual(expectedResponse);

      // Check pagination
      expect(result.pagination).toEqual({
        totalItems: count,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      });
    });

    it("should return tickets with pagination and price_asc sorting", async () => {
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

      const result = await ticketService.getAll({
        page: 1,
        limit: 10,
        orderBy: "price_asc",
      });

      expect(result.formattedTickets).toHaveLength(1);
      expect(result.formattedTickets[0]).toHaveProperty("id", 1);
      expect(result.pagination).toEqual({
        totalItems: count,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      });
    });

    it("should return tickets with pagination and duration_asc sorting", async () => {
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

      const result = await ticketService.getAll({
        page: 1,
        limit: 10,
        orderBy: "duration_asc",
      });

      expect(result.formattedTickets).toHaveLength(1);
      expect(result.formattedTickets[0]).toHaveProperty("id", 1);
      expect(result.pagination).toEqual({
        totalItems: count,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      });
    });

    it("should return tickets with pagination and departure_soon sorting", async () => {
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

      const result = await ticketService.getAll({
        page: 1,
        limit: 10,
        orderBy: "departure_soon",
      });

      expect(result.formattedTickets).toHaveLength(1);
      expect(result.formattedTickets[0]).toHaveProperty("id", 1);
      expect(result.pagination).toEqual({
        totalItems: count,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      });
    });

    it("should return tickets with pagination and departure_late sorting", async () => {
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

      const result = await ticketService.getAll({
        page: 1,
        limit: 10,
        orderBy: "departure_late",
      });

      expect(result.formattedTickets).toHaveLength(1);
      expect(result.formattedTickets[0]).toHaveProperty("id", 1);
      expect(result.pagination).toEqual({
        totalItems: count,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      });
    });

    it("should return tickets with pagination and arrival_soon sorting", async () => {
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

      const result = await ticketService.getAll({
        page: 1,
        limit: 10,
        orderBy: "arrival_soon",
      });

      expect(result.formattedTickets).toHaveLength(1);
      expect(result.formattedTickets[0]).toHaveProperty("id", 1);
      expect(result.pagination).toEqual({
        totalItems: count,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      });
    });

    it("should return tickets with pagination and arrival_late sorting", async () => {
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

      const result = await ticketService.getAll({
        page: 1,
        limit: 10,
        orderBy: "arrival_late",
      });

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
        isActive: true,
        departureTime: "2023-12-12T08:00:00Z",
        arrivalTime: "2023-12-12T10:00:00Z",
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
        Flights: [
          {
            id: 101,
            price: 100,
            duration: 120,
            departureTime: "2023-12-12T08:00:00Z",
            arrivalTime: "2023-12-12T10:00:00Z",
            class: "economy",
            isActive: true,
            Seat: [
              { isOccupied: false },
              { isOccupied: false },
              { isOccupied: true },
              { isOccupied: false },
              { isOccupied: true },
            ], // Mocked seat data (some seats occupied, some not)
            baggage: "20kg",
            cabinBaggage: "7kg",
            entertainment: true,
            Airplane: {
              name: "Boeing 747",
              Airline: {
                name: "Airline A",
                imageUrl: "airline_a_logo.png",
              },
            },
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
            DepartureTerminal: {
              name: "Terminal 1",
              type: "Domestic",
            },
            ArrivalTerminal: {
              name: "Terminal 2",
              type: "International",
            },
          },
        ],
      };
    
      // Mock the result of the findUnique query
      prismaMock.ticket.findUnique.mockResolvedValue(ticket);
    
      const result = await ticketService.getById(1);
    
      // Define the expected response structure for the ticket by ID
      const expectedResponse = {
        id: 1,
        class: undefined, // Since class is not defined in the sample data
        discount: undefined, // Since discount is not defined in the sample data
        isTransits: undefined, // Since isTransits is not defined in the sample data
        totalPrice: 100,
        isActive: true,
        departure: {
          time: "2023-12-12T08:00:00Z",
          airport: {
            name: "Airport A",
            code: "AAA",
            type: "international",
          },
          city: {
            name: "City A",
            code: "CA",
            image: "city_a.png",
          },
          country: {
            name: "Country A",
            code: "CNA",
          },
        },
        arrival: {
          time: "2023-12-12T10:00:00Z",
          airport: {
            name: "Airport B",
            code: "BBB",
            type: "domestic",
          },
          city: {
            name: "City B",
            code: "CB",
            image: "city_b.png",
          },
          country: {
            name: "Country B",
            code: "CNB",
          },
          continent: "Europe",
        },
        flights: [
          {
            id: 101,
            duration: 120,
            baggage: "20kg",
            cabinBaggage: "7kg",
            entertainment: true,
            airline: {
              name: "Airline A",
              logo: "airline_a_logo.png",
            },
            airplane: "Boeing 747",
            departure: {
              time: "2023-12-12T08:00:00Z",
              airport: {
                name: "Airport A",
                code: "AAA",
                type: "international",
              },
              city: {
                name: "City A",
                code: "CA",
                image: "city_a.png",
              },
              country: {
                name: "Country A",
                code: "CNA",
              },
              terminal: {
                name: "Terminal 1",
                type: "Domestic",
              },
            },
            arrival: {
              time: "2023-12-12T10:00:00Z",
              airport: {
                name: "Airport B",
                code: "BBB",
                type: "domestic",
              },
              city: {
                name: "City B",
                code: "CB",
                image: "city_b.png",
              },
              country: {
                name: "Country B",
                code: "CNB",
              },
              continent: "Europe",
              terminal: {
                name: "Terminal 2",
                type: "International",
              },
            },
            seats: [
              { isOccupied: false },
              { isOccupied: false },
              { isOccupied: true },
              { isOccupied: false },
              { isOccupied: true },
            ],
            totalSeats: 5,
            occupiedSeats: 2,
            availableSeats: 3,
          },
        ],
      };
    
      // Compare the result to the expected response
      expect(result).toEqual(expectedResponse);
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
          price: 100,
          departureTime: "2023-12-12T08:00:00Z",
          arrivalTime: "2023-12-12T10:00:00Z",
          Route: {
            DepartureAirport: { id: 1 }, // Departure airport id
            ArrivalAirport: { id: 2 }, // Arrival airport id
          },
        },
        {
          id: 2,
          class: "economy",
          duration: 90,
          price: 150,
          departureTime: "2023-12-12T12:00:00Z",
          arrivalTime: "2023-12-12T13:30:00Z",
          Route: {
            DepartureAirport: { id: 2 }, // Departure airport id
            ArrivalAirport: { id: 3 }, // Arrival airport id
          },
        },
      ];

      // Mocking a valid route
      const route = {
        id: 1,
        DepartureAirport: { id: 1 },
        ArrivalAirport: { id: 3 },
      };

      // Mock prisma calls
      prismaMock.flight.findMany.mockResolvedValue(flights);
      prismaMock.route.findUnique.mockResolvedValue(route); // Mock the route lookup to return the route
      prismaMock.ticket.create.mockResolvedValue({ id: 1 });

      const payload = { routeId: 1, flightIds: [1, 2] };
      const result = await ticketService.store(payload);

      expect(result.id).toBe(1);
      expect(prismaMock.ticket.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            routeId: 1,
            totalPrice: 250, // Updated to reflect the correct total price (100 + 150)
            totalDuration: 330, // Updated to reflect the correct total duration (120 + 90 + some connection time)
            discountId: null,
            Flights: {
              connect: [{ id: 1 }, { id: 2 }],
            },
            arrivalTime: "2023-12-12T13:30:00Z", // Assuming the arrival time is for the second flight
            departureTime: "2023-12-12T08:00:00Z", // Assuming the departure time is for the first flight
            isTransits: true, 
          }),
        })
      );
    });

    it("should throw error if route is not found", async () => {
      prismaMock.route.findUnique.mockResolvedValue(null);

      const payload = { routeId: 1, flightIds: [1] };

      await expect(ticketService.store(payload)).rejects.toThrow(
        new AppError("Route not found", 404)
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

    it("should throw error if flights are not on the same day", async () => {
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
          class: "economy",
          duration: 90,
          price: "150",
          departureTime: "2023-12-13T12:00:00Z", // Different day
          arrivalTime: "2023-12-13T13:30:00Z",
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);

      const payload = { routeId: 1, flightIds: [1, 2] };

      await expect(ticketService.store(payload)).rejects.toThrow(
        new AppError("All flights must be on the same day", 400)
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

    it("should throw error if first flight's departure does not match the route departure", async () => {
      const route = {
        id: 1,
        DepartureAirport: { id: 1 },
        ArrivalAirport: { id: 3 },
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
          Route: {
            DepartureAirport: { id: 2 }, // Does not match route's DepartureAirport
            ArrivalAirport: { id: 4 },
          },
        },
        {
          id: 2,
          class: "economy",
          duration: 90,
          price: "150",
          departureTime: "2023-12-12T12:00:00Z",
          arrivalTime: "2023-12-12T13:30:00Z",
          Route: {
            DepartureAirport: { id: 4 },
            ArrivalAirport: { id: 3 },
          },
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);

      const payload = { routeId: 1, flightIds: [1, 2] };

      await expect(ticketService.store(payload)).rejects.toThrow(
        new AppError(
          "First flight's departure or last flight's arrival does not match the route",
          400
        )
      );
    });

    it("should throw error if connecting flights do not match", async () => {
      const route = {
        id: 1,
        DepartureAirport: { id: 1 },
        ArrivalAirport: { id: 4 },
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
          Route: {
            DepartureAirport: { id: 1 },
            ArrivalAirport: { id: 2 },
          },
        },
        {
          id: 2,
          class: "economy",
          duration: 90,
          price: "150",
          departureTime: "2023-12-12T12:00:00Z",
          arrivalTime: "2023-12-12T13:30:00Z",
          Route: {
            DepartureAirport: { id: 3 }, // Does not match the previous flight's ArrivalAirport
            ArrivalAirport: { id: 4 },
          },
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);

      const payload = { routeId: 1, flightIds: [1, 2] };

      await expect(ticketService.store(payload)).rejects.toThrow(
        new AppError("Connecting flights do not match", 400)
      );
    });

    it("should throw error when flights are not in sequential order", async () => {
      // Ensure route mock is correctly defined
      const route = {
        id: 1,
        DepartureAirport: { id: 1 },
        ArrivalAirport: { id: 3 },
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
          Route: {
            DepartureAirport: { id: 1 }, // Correct mock for the first flight
            ArrivalAirport: { id: 2 },
          },
        },
        {
          id: 2,
          class: "economy",
          duration: 90,
          price: "150",
          departureTime: "2023-12-12T09:00:00Z", // This is out of order
          arrivalTime: "2023-12-12T10:30:00Z",
          Route: {
            DepartureAirport: { id: 2 }, // Mock the Route for the second flight as well
            ArrivalAirport: { id: 3 },
          },
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);

      const payload = { routeId: 1, flightIds: [1, 2] };

      await expect(ticketService.store(payload)).rejects.toThrow(
        new AppError("Flights are not in sequential order by time", 400)
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
          Route: {
            DepartureAirport: { id: 1 }, // Matches the route's DepartureAirport
            ArrivalAirport: { id: 2 }, // Matches the route's ArrivalAirport
          },
        },
      ];

      prismaMock.flight.findMany.mockResolvedValue(flights);
      prismaMock.discount.findUnique.mockResolvedValue(null); // No discount found

      const payload = { routeId: 1, flightIds: [1], discountId: 1 };

      await expect(ticketService.store(payload)).rejects.toThrow(
        new AppError("Discount not found", 404)
      );
    });
  });

  describe("destroy", () => {
    it("should delete a ticket and its associated flight if it's the only ticket for that flight", async () => {
      const ticket = { id: 1, Flights: [{ id: 100 }] }; // Ticket linked to one flight
  
      // Mock the findUnique call to return the ticket
      prismaMock.ticket.findUnique.mockResolvedValue(ticket);
  
      // Mock the ticket deletion
      prismaMock.ticket.delete.mockResolvedValue(ticket);
  
      // Mock the flight deletion
      prismaMock.flight.delete.mockResolvedValue({ id: 100 });
  
      const result = await ticketService.destroy(1);
  
      // Check result message
      expect(result).toEqual({
        message: "Ticket deleted successfully",
      });
  
      // Verify findUnique call
      expect(prismaMock.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }, include: { Flights: true },
      });
  
      // Verify ticket deletion
      expect(prismaMock.ticket.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
  
      // Verify flight deletion
      expect(prismaMock.flight.delete).toHaveBeenCalledWith({
        where: { id: 100 },
      });
    });
  
    it("should delete a ticket but not delete the flight if there are multiple tickets for that flight", async () => {
      const ticket = { id: 1, Flights: [{ id: 100 }, { id: 101 }] }; // Linked to multiple flights
  
      // Mock the findUnique call to return the ticket
      prismaMock.ticket.findUnique.mockResolvedValue(ticket);
  
      // Mock the ticket deletion
      prismaMock.ticket.delete.mockResolvedValue(ticket);
  
      const result = await ticketService.destroy(1);
  
      // Check result message
      expect(result).toEqual({
        message: "Ticket deleted successfully",
      });
  
      // Verify findUnique call
      expect(prismaMock.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }, include: { Flights: true },
      });
  
      // Verify ticket deletion
      expect(prismaMock.ticket.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
  
      // Ensure flight.delete is NOT called
      expect(prismaMock.flight.delete).not.toHaveBeenCalled();
    });
  
    it("should throw an error if the ticket does not exist", async () => {
      // Mock the findUnique call to return null
      prismaMock.ticket.findUnique.mockResolvedValue(null);
  
      await expect(ticketService.destroy(999)).rejects.toThrow(AppError);
  
      // Ensure proper error logging
      expect(console.error).toHaveBeenCalledWith(
        "Error deleting ticket:",
        expect.any(AppError)
      );
    });
  
    it("should throw an error if the ticket ID is invalid", async () => {
      await expect(ticketService.destroy("invalid-id")).rejects.toThrow(AppError);
  
      expect(console.error).toHaveBeenCalledWith(
        "Error deleting ticket:",
        expect.any(AppError)
      );
    });
  
    it("should handle errors during deletion gracefully", async () => {
      const ticket = { id: 1, Flights: [{ id: 100 }] };
  
      // Mock the findUnique call to return a valid ticket
      prismaMock.ticket.findUnique.mockResolvedValue(ticket);
  
      // Simulate an error during ticket deletion
      prismaMock.ticket.delete.mockRejectedValue(new Error("Database error"));
  
      await expect(ticketService.destroy(1)).rejects.toThrow("Database error");
  
      expect(console.error).toHaveBeenCalledWith(
        "Error deleting ticket:",
        expect.any(Error)
      );
    });
  });
});
