import * as airportService from "../airport.service";
import prismaMock from "../../utils/singleton";
import AppError from "../../utils/AppError";

describe("Airport Service", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createAirport", () => {
    it("should create a new airport with the provided data", async () => {
      const payload = {
        iataCode: "JFK",
        name: "John F. Kennedy International Airport",
        latitude: 40.6413,
        longitude: -73.7781,
        type: "International",
        cityId: "NYC",
      };

      const newAirport = {
        id: 1,
        ...payload,
        City: { code: payload.cityId },
      };

      prismaMock.airport.create.mockResolvedValue(newAirport);

      const result = await airportService.createAirport(payload);

      expect(result).toEqual(newAirport);
      expect(prismaMock.airport.create).toHaveBeenCalledWith({
        data: {
          iataCode: payload.iataCode,
          name: payload.name,
          latitude: payload.latitude,
          longitude: payload.longitude,
          type: payload.type,
          City: { connect: { code: payload.cityId } },
        },
      });
    });

    it("should throw an error if airport creation fails", async () => {
      const payload = {
        iataCode: "JFK",
        name: "John F. Kennedy International Airport",
        latitude: 40.6413,
        longitude: -73.7781,
        type: "International",
        cityId: "NYC",
      };

      prismaMock.airport.create.mockRejectedValue(new Error("Database error"));

      await expect(airportService.createAirport(payload)).rejects.toThrow(
        Error
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error creating airport:",
        expect.any(Error)
      );
    });
  });

  describe("getAllAirports", () => {
    it("should fetch all airports with city details and route counts", async () => {
      const airports = [
        {
          id: 1,
          iataCode: "JFK",
          name: "John F. Kennedy International Airport",
          latitude: 40.6413,
          longitude: -73.7781,
          type: "International",
          City: { code: "NYC" },
          _count: {
            departureRoutes: 5,
            arrivalRoutes: 7,
          },
        },
        {
          id: 2,
          iataCode: "LAX",
          name: "Los Angeles International Airport",
          latitude: 33.9416,
          longitude: -118.4085,
          type: "International",
          City: { code: "LAX" },
          _count: {
            departureRoutes: 8,
            arrivalRoutes: 6,
          },
        },
      ];
    
      // Mock the Prisma call
      prismaMock.airport.findMany.mockResolvedValue(airports);
    
      // Call the function
      const result = await airportService.getAllAirports();
    
      // Expectations
      expect(result).toEqual(airports);
      expect(prismaMock.airport.findMany).toHaveBeenCalledWith({
        include: {
          City: true,
          _count: {
            select: { departureRoutes: true, arrivalRoutes: true },
          },
        },
      });
    });

    it("should throw an error if fetching airports fails", async () => {
      prismaMock.airport.findMany.mockRejectedValue(new Error("Database error"));

      await expect(airportService.getAllAirports()).rejects.toThrow(Error);
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching airports:",
        expect.any(Error)
      );
    });
  });

  describe("getAirportByIataCode", () => {
    it("should fetch an airport by IATA code", async () => {
      const airport = {
        id: 1,
        iataCode: "JFK",
        name: "John F. Kennedy International Airport",
        latitude: 40.6413,
        longitude: -73.7781,
        type: "International",
        City: { code: "NYC" },
        Terminals: [],
        departureRoutes: [],
        arrivalRoutes: [],
      };

      prismaMock.airport.findUnique.mockResolvedValue(airport);

      const result = await airportService.getAirportByIataCode("JFK");

      expect(result).toEqual(airport);
      expect(prismaMock.airport.findUnique).toHaveBeenCalledWith({
        where: { iataCode: "JFK" },
        include: {
          City: true,
          Terminals: true,
          departureRoutes: true,
          arrivalRoutes: true,
        },
      });
    });

    it("should throw an error if the airport is not found", async () => {
      prismaMock.airport.findUnique.mockResolvedValue(null);

      await expect(
        airportService.getAirportByIataCode("JFK")
      ).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching airport:",
        expect.any(Error)
      );
    });
  });

  describe("updateAirport", () => {
    it("should update airport details", async () => {
      const payload = { name: "Updated Airport Name" };
      const existingAirport = { iataCode: "JFK", name: "Original Name" };
      const updatedAirport = { ...existingAirport, ...payload };

      prismaMock.airport.findUnique.mockResolvedValue(existingAirport);
      prismaMock.airport.update.mockResolvedValue(updatedAirport);

      const result = await airportService.updateAirport("JFK", payload);

      expect(result).toEqual(updatedAirport);
      expect(prismaMock.airport.findUnique).toHaveBeenCalledWith({
        where: { iataCode: "JFK" },
      });
      expect(prismaMock.airport.update).toHaveBeenCalledWith({
        where: { iataCode: "JFK" },
        data: payload,
      });
    });

    it("should throw an error if the airport is not found", async () => {
      prismaMock.airport.findUnique.mockResolvedValue(null);

      await expect(
        airportService.updateAirport("JFK", { name: "Updated Airport Name" })
      ).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error updating airport:",
        expect.any(Error)
      );
    });
  });

  describe("deleteAirport", () => {
    it("should delete an airport by IATA code", async () => {
      const airport = { iataCode: "JFK", name: "John F. Kennedy International Airport" };

      prismaMock.airport.findUnique.mockResolvedValue(airport);
      prismaMock.airport.delete.mockResolvedValue(airport);

      const result = await airportService.deleteAirport("JFK");

      expect(result).toEqual({
        message: `Airport with IATA code JFK deleted successfully`,
      });
      expect(prismaMock.airport.delete).toHaveBeenCalledWith({
        where: { iataCode: "JFK" },
      });
    });

    it("should throw an error if the airport is not found", async () => {
      prismaMock.airport.findUnique.mockResolvedValue(null);

      await expect(airportService.deleteAirport("JFK")).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error deleting airport:",
        expect.any(Error)
      );
    });
  });
});
