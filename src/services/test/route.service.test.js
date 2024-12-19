import * as routeService from "../route.service";
import prismaMock from "../../utils/singleton";
import AppError from "../../utils/AppError";
import haversine from "haversine";

jest.mock("haversine");

describe("Route Service", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    haversine.mockImplementation(() => 100); // Mock the haversine result to return a fixed distance (100 km)
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createRoute", () => {
    it("should create a new route with valid departure and arrival airports", async () => {
      const payload = {
        departureAirportId: "JFK",
        arrivalAirportId: "LAX",
      };
  
      const departureAirport = {
        iataCode: "JFK",
        latitude: 40.6413,
        longitude: -73.7781,
      };
      const arrivalAirport = {
        iataCode: "LAX",
        latitude: 33.9416,
        longitude: -118.4085,
      };
  
      const newRoute = {
        id: 1,
        departureAirportId: "JFK",
        arrivalAirportId: "LAX",
        distance: 100, 
      };
  
      prismaMock.airport.findUnique.mockResolvedValueOnce(departureAirport);
      prismaMock.airport.findUnique.mockResolvedValueOnce(arrivalAirport);
      prismaMock.route.create.mockResolvedValue(newRoute);
  
      const result = await routeService.createRoute(payload);
  
      expect(result).toEqual(newRoute);
      expect(prismaMock.airport.findUnique).toHaveBeenCalledTimes(2);
      expect(prismaMock.route.create).toHaveBeenCalledWith({
        data: {
          DepartureAirport: {
            connect: { iataCode: payload.departureAirportId },
          },
          ArrivalAirport: { connect: { iataCode: payload.arrivalAirportId } },
          distance: parseFloat(newRoute.distance.toFixed(2)),
        },
      });
    });
  
    it("should throw an error if departure and arrival airports are the same", async () => {
      const payload = {
        departureAirportId: "JFK",
        arrivalAirportId: "JFK",
      };
  
      await expect(routeService.createRoute(payload)).rejects.toThrow(
        "Departure and arrival airports cannot be the same"
      );
    });
  
    it("should throw an error if departure airport is not found", async () => {
      const payload = {
        departureAirportId: "INVALID",
        arrivalAirportId: "LAX",
      };
  
      prismaMock.airport.findUnique.mockResolvedValueOnce(null);
  
      await expect(routeService.createRoute(payload)).rejects.toThrow(
        `Departure airport ${payload.departureAirportId} not found`
      );
  
      expect(prismaMock.airport.findUnique).toHaveBeenCalledTimes(2);
    });
  
    it("should throw an error if arrival airport is not found", async () => {
      const payload = {
        departureAirportId: "JFK",
        arrivalAirportId: "INVALID",
      };
  
      const departureAirport = {
        iataCode: "JFK",
        latitude: 40.6413,
        longitude: -73.7781,
      };
  
      prismaMock.airport.findUnique.mockResolvedValueOnce(departureAirport);
      prismaMock.airport.findUnique.mockResolvedValueOnce(null);
  
      await expect(routeService.createRoute(payload)).rejects.toThrow(
        `Arrival airport ${payload.arrivalAirportId} not found`
      );
  
      expect(prismaMock.airport.findUnique).toHaveBeenCalledTimes(2);
    });
  
    it("should throw an error if the route already exists", async () => {
      const payload = {
        departureAirportId: "JFK",
        arrivalAirportId: "LAX",
      };
  
      const departureAirport = {
        iataCode: "JFK",
        latitude: 40.6413,
        longitude: -73.7781,
      };
      const arrivalAirport = {
        iataCode: "LAX",
        latitude: 33.9416,
        longitude: -118.4085,
      };
  
      prismaMock.airport.findUnique.mockResolvedValueOnce(departureAirport);
      prismaMock.airport.findUnique.mockResolvedValueOnce(arrivalAirport);
      prismaMock.route.create.mockRejectedValue({
        code: "P2002",
      });
  
      await expect(routeService.createRoute(payload)).rejects.toThrow(
        "Route already exists"
      );
  
      expect(prismaMock.airport.findUnique).toHaveBeenCalledTimes(2);
      expect(prismaMock.route.create).toHaveBeenCalled();
    });
  });
  

  describe("getRoutes", () => {
    it("should return all routes with their departure and arrival airports", async () => {
      const routes = [
        {
          id: 1,
          DepartureAirport: {
            name: "JFK",
            City: {
              code: "NYC",
              name: "New York",
              countryCode: "USA",
              country: "United States",
            },
          },
          ArrivalAirport: {
            name: "LAX",
            City: {
              code: "LAX",
              name: "Los Angeles",
              countryCode: "USA",
              country: "United States",
            },
          },
          distance: 100,
        },
      ];

      prismaMock.route.findMany.mockResolvedValue(routes);

      const result = await routeService.getRoutes();

      expect(result).toEqual(routes);
      expect(prismaMock.route.findMany).toHaveBeenCalledWith({
        include: {
          DepartureAirport: {
            select: {
              name: true,
              City: {
                select: {
                  code: true,
                  name: true,
                  countryCode: true,
                  country: true,
                },
              },
            },
          },
          ArrivalAirport: {
            select: {
              name: true,
              City: {
                select: {
                  code: true,
                  name: true,
                  countryCode: true,
                  country: true,
                },
              },
            },
          },
        },
      });
    });

    it("should throw an error if fetching routes fails", async () => {
      prismaMock.route.findMany.mockRejectedValue(new Error("Database error"));

      await expect(routeService.getRoutes()).rejects.toThrow(Error);
      expect(console.error).toHaveBeenCalledWith(
        "Error getting routes: ",
        expect.any(Error)
      );
    });
  });

  describe("getRouteByAirports", () => {
    it("should fetch a route by departure and arrival airports", async () => {
      const route = {
        id: 1,
        departureAirportId: "JFK",
        arrivalAirportId: "LAX",
        distance: 100,
        DepartureAirport: {
          name: "John F. Kennedy International Airport",
          City: {
            code: "NYC",
            name: "New York",
            country: "United States",
            countryCode: "US",
          },
        },
        ArrivalAirport: {
          name: "Los Angeles International Airport",
          City: {
            code: "LAX",
            name: "Los Angeles",
            country: "United States",
            countryCode: "US",
          },
        },
      };

      prismaMock.route.findUnique.mockResolvedValue(route);

      const result = await routeService.getRouteByAirports("JFK", "LAX");

      expect(result).toEqual(route);
      expect(prismaMock.route.findUnique).toHaveBeenCalledWith({
        where: {
          departureAirportId_arrivalAirportId: {
            departureAirportId: "JFK",
            arrivalAirportId: "LAX",
          },
        },
        include: {
          DepartureAirport: {
            select: {
              name: true,
              City: {
                select: {
                  code: true,
                  name: true,
                  country: true,
                  countryCode: true,
                },
              },
            },
          },
          ArrivalAirport: {
            select: {
              name: true,
              City: {
                select: {
                  code: true,
                  name: true,
                  country: true,
                  countryCode: true,
                },
              },
            },
          },
        },
      });
    });

    it("should throw an error if the route is not found", async () => {
      prismaMock.route.findUnique.mockResolvedValue(null);

      await expect(
        routeService.getRouteByAirports("JFK", "INVALID")
      ).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error getting route: ",
        expect.any(Error)
      );
    });

    it("should throw an error if the database operation fails", async () => {
      prismaMock.route.findUnique.mockRejectedValue(new Error("Database error"));

      await expect(
        routeService.getRouteByAirports("JFK", "LAX")
      ).rejects.toThrow(Error);
      expect(console.error).toHaveBeenCalledWith(
        "Error getting route: ",
        expect.any(Error)
      );
    });
  });
  
  describe("getRoute", () => {
    it("should fetch a route by ID", async () => {
      const route = {
        id: 1,
        departureAirportId: "JFK",
        arrivalAirportId: "LAX",
        distance: 100,
        DepartureAirport: {
          name: "John F. Kennedy International Airport",
          City: {
            code: "NYC",
            name: "New York",
            country: "United States",
            countryCode: "US",
          },
        },
        ArrivalAirport: {
          name: "Los Angeles International Airport",
          City: {
            code: "LAX",
            name: "Los Angeles",
            country: "United States",
            countryCode: "US",
          },
        },
      };

      prismaMock.route.findUnique.mockResolvedValue(route);

      const result = await routeService.getRoute(1);

      expect(result).toEqual(route);
      expect(prismaMock.route.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          DepartureAirport: {
            select: {
              name: true,
              City: {
                select: {
                  code: true,
                  name: true,
                  country: true,
                  countryCode: true,
                },
              },
            },
          },
          ArrivalAirport: {
            select: {
              name: true,
              City: {
                select: {
                  code: true,
                  name: true,
                  country: true,
                  countryCode: true,
                },
              },
            },
          },
        },
      });
    });

    it("should throw an error if the route is not found", async () => {
      prismaMock.route.findUnique.mockResolvedValue(null);

      await expect(routeService.getRoute(1)).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error getting route: ",
        expect.any(Error)
      );
    });

    it("should throw an error if the database operation fails", async () => {
      prismaMock.route.findUnique.mockRejectedValue(new Error("Database error"));

      await expect(routeService.getRoute(1)).rejects.toThrow(Error);
      expect(console.error).toHaveBeenCalledWith(
        "Error getting route: ",
        expect.any(Error)
      );
    });
  });

  describe("updateRoute", () => {
    it("should update route and recalculate distance if airports change", async () => {
      haversine.mockImplementation(() => 200);

      const payload = {
        departureAirportId: "SFO",
        arrivalAirportId: "ORD",
        distance: 200,
      };
      const existingRoute = {
        id: 1,
        departureAirportId: "JFK",
        arrivalAirportId: "LAX",
        distance: 100,
      };
      const updatedRoute = { id: 1, ...payload };

      const departureAirport = {
        iataCode: "SFO",
        latitude: 37.7749,
        longitude: -122.4194,
      };
      const arrivalAirport = {
        iataCode: "ORD",
        latitude: 41.9744,
        longitude: -87.9075,
      };

      prismaMock.route.findUnique.mockResolvedValue(existingRoute);
      prismaMock.airport.findUnique.mockResolvedValueOnce(departureAirport);
      prismaMock.airport.findUnique.mockResolvedValueOnce(arrivalAirport);
      prismaMock.route.update.mockResolvedValue(updatedRoute);

      const result = await routeService.updateRoute(1, payload);

      expect(result).toEqual(updatedRoute);
      expect(prismaMock.route.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          departureAirportId: "SFO",
          arrivalAirportId: "ORD",
          distance: 200,
        },
      });
    });

    it("should handle case when no departureAirportId or arrivalAirportId is provided in payload", async () => {
      const payload = {}; // Neither departureAirportId nor arrivalAirportId

      const existingRoute = {
        id: 1,
        departureAirportId: "JFK",
        arrivalAirportId: "LAX",
        distance: 100,
      };

      prismaMock.route.findUnique.mockResolvedValue(existingRoute);

      const result = await routeService.updateRoute(1, payload);

      expect(result).toEqual(undefined); // Ensure the route remains unchanged
      expect(prismaMock.route.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {}, // No updates should be made
      });
    });

    it("should recalculate distance if only departureAirportId changes", async () => {
      haversine.mockImplementation(() => 200);

      const payload = {
        departureAirportId: "SFO",
      };
      const existingRoute = {
        id: 1,
        departureAirportId: "JFK",
        arrivalAirportId: "LAX",
        distance: 100,
      };
      const departureAirport = {
        iataCode: "SFO",
        latitude: 37.7749,
        longitude: -122.4194,
      };
      const arrivalAirport = {
        iataCode: "LAX",
        latitude: 33.9416,
        longitude: -118.4085,
      };
      const updatedRoute = {
        id: 1,
        ...existingRoute,
        ...payload,
        distance: 200,
      };

      prismaMock.route.findUnique.mockResolvedValue(existingRoute);
      prismaMock.airport.findUnique.mockResolvedValueOnce(departureAirport);
      prismaMock.airport.findUnique.mockResolvedValueOnce(arrivalAirport);
      prismaMock.route.update.mockResolvedValue(updatedRoute);

      const result = await routeService.updateRoute(1, payload);

      expect(result).toEqual(updatedRoute);
      expect(prismaMock.airport.findUnique).toHaveBeenCalledTimes(2);
      expect(prismaMock.route.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          departureAirportId: "SFO",
          distance: 200,
        },
      });
    });

    it("should recalculate distance if only arrivalAirportId changes", async () => {
      haversine.mockImplementation(() => 300);

      const payload = {
        arrivalAirportId: "ORD",
      };
      const existingRoute = {
        id: 1,
        departureAirportId: "JFK",
        arrivalAirportId: "LAX",
        distance: 100,
      };
      const departureAirport = {
        iataCode: "JFK",
        latitude: 40.6413,
        longitude: -73.7781,
      };
      const arrivalAirport = {
        iataCode: "ORD",
        latitude: 41.9744,
        longitude: -87.9075,
      };
      const updatedRoute = {
        id: 1,
        ...existingRoute,
        ...payload,
        distance: 300,
      };

      prismaMock.route.findUnique.mockResolvedValue(existingRoute);
      prismaMock.airport.findUnique.mockResolvedValueOnce(departureAirport);
      prismaMock.airport.findUnique.mockResolvedValueOnce(arrivalAirport);
      prismaMock.route.update.mockResolvedValue(updatedRoute);

      const result = await routeService.updateRoute(1, payload);

      expect(result).toEqual(updatedRoute);
      expect(prismaMock.airport.findUnique).toHaveBeenCalledTimes(2);
      expect(prismaMock.route.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          arrivalAirportId: "ORD",
          distance: 300,
        },
      });
    });

    it("should throw an error if the route is not found", async () => {
      prismaMock.route.findUnique.mockResolvedValue(null);

      await expect(
        routeService.updateRoute(1, { departureAirportId: "SFO" })
      ).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error updating route: ",
        expect.any(Error)
      );
    });

    it("should throw an error if route already exists (unique constraint violation)", async () => {
      const payload = {
        departureAirportId: "JFK",
        arrivalAirportId: "LAX",
      };

      const departureAirport = {
        iataCode: "JFK",
        latitude: 40.6413,
        longitude: -73.7781,
      };
      const arrivalAirport = {
        iataCode: "LAX",
        latitude: 33.9416,
        longitude: -118.4085,
      };

      const existingRoute = {
        id: 1,
        departureAirportId: "JFK",
        arrivalAirportId: "LAX",
        distance: 100,
      };

      prismaMock.route.findUnique.mockResolvedValueOnce(existingRoute);
      prismaMock.airport.findUnique.mockResolvedValueOnce(departureAirport);
      prismaMock.airport.findUnique.mockResolvedValueOnce(arrivalAirport);

      prismaMock.route.update.mockRejectedValueOnce({
        code: "P2002", // Prisma unique constraint violation code
      });

      await expect(routeService.updateRoute(1, payload)).rejects.toThrow(
        AppError
      );

      expect(console.error).toHaveBeenCalledWith("Error updating route: ", {
        code: "P2002",
      });
    });

    it("should throw an error if departure airport is not found", async () => {
      const existingRoute = {
        id: 1,
        departureAirportId: "JFK",
        arrivalAirportId: "LAX",
        distance: 100,
      };

      const payload = {
        departureAirportId: "SFO",
        arrivalAirportId: "ORD",
      };

      prismaMock.route.findUnique.mockResolvedValueOnce(existingRoute);
      prismaMock.airport.findUnique.mockResolvedValueOnce(null);

      await expect(routeService.updateRoute(1, payload)).rejects.toThrow(
        AppError
      );

      expect(console.error).toHaveBeenCalledWith(
        "Error updating route: ",
        expect.any(Error)
      );
    });

    it("should throw an error if arrival airport is not found", async () => {
      const existingRoute = {
        id: 1,
        departureAirportId: "JFK",
        arrivalAirportId: "LAX",
        distance: 100,
      };

      const payload = {
        departureAirportId: "SFO",
        arrivalAirportId: "ORD",
      };

      const departureAirport = {
        iataCode: "SFO",
        latitude: 37.7749,
        longitude: -122.4194,
      };

      prismaMock.route.findUnique.mockResolvedValueOnce(existingRoute);
      prismaMock.airport.findUnique.mockResolvedValueOnce(departureAirport);
      prismaMock.airport.findUnique.mockResolvedValueOnce(null);

      await expect(routeService.updateRoute(1, payload)).rejects.toThrow(
        AppError
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error updating route: ",
        expect.any(Error)
      );
    });
  });

  describe("deleteRoute", () => {
    it("should delete a route", async () => {
      const route = {
        id: 1,
        departureAirportId: "JFK",
        arrivalAirportId: "LAX",
        distance: 100,
      };

      prismaMock.route.findUnique.mockResolvedValue(route);
      prismaMock.route.delete.mockResolvedValue(route);

      const result = await routeService.deleteRoute(1);

      expect(result).toEqual(route);
      expect(prismaMock.route.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw an error if the route is not found", async () => {
      prismaMock.route.findUnique.mockResolvedValue(null);

      await expect(routeService.deleteRoute(1)).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error deleting route: ",
        expect.any(Error)
      );
    });
  });
});
