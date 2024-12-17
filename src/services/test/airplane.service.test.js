import * as airplaneService from "../airplane.service";
import prismaMock from "../../utils/singleton";
import AppError from "../../utils/AppError";

describe("Airplane Service", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createAirplane", () => {
    it("should create a new airplane with the provided data", async () => {
      const payload = {
        airlineId: "AA",
        name: "Boeing 747",
        type: "Passenger",
        pricePerKm: 50,
      };
      const newAirplane = {
        id: 1,
        ...payload,
        Airline: { iataCode: payload.airlineId },
      };

      prismaMock.airplane.create.mockResolvedValue(newAirplane);

      const result = await airplaneService.createAirplane(payload);

      expect(result).toEqual(newAirplane);
      expect(prismaMock.airplane.create).toHaveBeenCalledWith({
        data: {
          Airline: { connect: { iataCode: payload.airlineId } },
          name: payload.name,
          type: payload.type,
          pricePerKm: payload.pricePerKm,
        },
      });
    });

    it("should throw an error if airplane creation fails", async () => {
      const payload = {
        airlineId: "AA",
        name: "Boeing 747",
        type: "Passenger",
        pricePerKm: 50,
      };

      prismaMock.airplane.create.mockRejectedValue(new Error("Database error"));

      await expect(airplaneService.createAirplane(payload)).rejects.toThrow(
        Error
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error creating airplane:",
        expect.any(Error)
      );
    });
  });

  describe("getAllAirplanes", () => {
    it("should fetch all airplanes with airline and flight count included", async () => {
      const airplanes = [
        {
          id: 1,
          name: "Boeing 747",
          type: "Passenger",
          pricePerKm: 50,
          Airline: { iataCode: "AA" },
          _count: { Flights: 10 },
        },
        {
          id: 2,
          name: "Airbus A380",
          type: "Passenger",
          pricePerKm: 60,
          Airline: { iataCode: "BA" },
          _count: { Flights: 5 },
        },
      ];
  
      prismaMock.airplane.findMany.mockResolvedValue(airplanes);
  
      const result = await airplaneService.getAllAirplanes();
  
      expect(result).toEqual(airplanes);
      expect(prismaMock.airplane.findMany).toHaveBeenCalledWith({
        include: { Airline: true, _count: { select: { Flights: true } } },
      });
    });
  
    it("should fetch airplanes filtered by airlineId", async () => {
      const airlineId = 1;
      const airplanes = [
        {
          id: 1,
          name: "Boeing 747",
          type: "Passenger",
          pricePerKm: 50,
          Airline: { iataCode: "AA" },
          _count: { Flights: 10 },
        },
      ];
  
      prismaMock.airplane.findMany.mockResolvedValue(airplanes);
  
      const result = await airplaneService.getAllAirplanes(airlineId);
  
      expect(result).toEqual(airplanes);
      expect(prismaMock.airplane.findMany).toHaveBeenCalledWith({
        where: { airlineId },
        include: { Airline: true, _count: { select: { Flights: true } } },
      });
    });
  
    it("should throw an error if fetching airplanes fails", async () => {
      prismaMock.airplane.findMany.mockRejectedValue(new Error("Database error"));
  
      await expect(airplaneService.getAllAirplanes()).rejects.toThrow(Error);
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching airplanes:",
        expect.any(Error)
      );
    });
  });

  describe("getAirplaneById", () => {
    it("should fetch an airplane by ID", async () => {
      const airplane = {
        id: 1,
        name: "Boeing 747",
        type: "Passenger",
        pricePerKm: 50,
        Airline: { iataCode: "AA" },
        Flights: [],
      };

      prismaMock.airplane.findUnique.mockResolvedValue(airplane);

      const result = await airplaneService.getAirplaneById(1);

      expect(result).toEqual(airplane);
      expect(prismaMock.airplane.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { Airline: true, Flights: true },
      });
    });

    it("should throw an error if the airplane is not found", async () => {
      prismaMock.airplane.findUnique.mockResolvedValue(null);

      await expect(airplaneService.getAirplaneById(1)).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching airplane:",
        expect.any(Error)
      );
    });
  });

  describe("updateAirplane", () => {
    it("should update airplane details", async () => {
      const payload = { name: "Updated Boeing 747" };
      const existingAirplane = { id: 1, name: "Boeing 747" };
      const updatedAirplane = { ...existingAirplane, ...payload };

      prismaMock.airplane.findUnique.mockResolvedValue(existingAirplane);
      prismaMock.airplane.update.mockResolvedValue(updatedAirplane);

      const result = await airplaneService.updateAirplane(1, payload);

      expect(result).toEqual(updatedAirplane);
      expect(prismaMock.airplane.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaMock.airplane.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: payload,
      });
    });

    it("should throw an error if the airplane is not found", async () => {
      prismaMock.airplane.findUnique.mockResolvedValue(null);

      await expect(
        airplaneService.updateAirplane(1, { name: "Updated Boeing 747" })
      ).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error updating airplane:",
        expect.any(Error)
      );
    });
  });

  describe("deleteAirplane", () => {
    it("should delete an airplane by ID", async () => {
      const airplane = { id: 1, name: "Boeing 747" };

      prismaMock.airplane.findUnique.mockResolvedValue(airplane);
      prismaMock.airplane.delete.mockResolvedValue(airplane);

      const result = await airplaneService.deleteAirplane(1);

      expect(result).toEqual({
        message: `Airplane with ID 1 deleted successfully`,
      });
      expect(prismaMock.airplane.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw an error if the airplane is not found", async () => {
      prismaMock.airplane.findUnique.mockResolvedValue(null);

      await expect(airplaneService.deleteAirplane(1)).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error deleting airplane:",
        expect.any(Error)
      );
    });
  });
});
