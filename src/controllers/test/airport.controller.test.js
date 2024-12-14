import {
    createAirport,
    getAllAirports,
    getAirportByIataCode,
    updateAirport,
    deleteAirport,
  } from "../airport.controller.js";
  import * as airportService from "../../services/airport.service.js";
  
  // Mock the airportService
  jest.mock("../../services/airport.service.js");
  
  describe("Airport Controller", () => {
    let req, res, next;
  
    beforeEach(() => {
      req = {
        body: {},
        params: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    describe("createAirport", () => {
      test("should create an airport and return 201 status", async () => {
        req.body = { iataCode: "JFK", name: "John F Kennedy", latitude: 40.6413, longitude: -73.7781, type: "International", cityId: "NYC" };
        const newAirport = { id: 1, ...req.body };
  
        airportService.createAirport.mockResolvedValue(newAirport);
  
        await createAirport(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Airport created successfully",
          data: newAirport,
          error: null,
        });
      });
  
      test("should handle error when creating an airport", async () => {
        const errorMessage = "Failed to create airport";
        req.body = { iataCode: "JFK", name: "John F Kennedy" };
        airportService.createAirport.mockRejectedValue(new Error(errorMessage));
  
        await createAirport(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("getAllAirports", () => {
      test("should return all airports with 200 status", async () => {
        const airports = [
          { id: 1, iataCode: "JFK", name: "John F Kennedy" },
          { id: 2, iataCode: "LAX", name: "Los Angeles International" },
        ];
        airportService.getAllAirports.mockResolvedValue(airports);
  
        await getAllAirports(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Airports fetched successfully",
          data: airports,
          error: null,
        });
      });
  
      test("should handle error when retrieving airports", async () => {
        const errorMessage = "Failed to fetch airports";
        airportService.getAllAirports.mockRejectedValue(new Error(errorMessage));
  
        await getAllAirports(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("getAirportByIataCode", () => {
      test("should return an airport by IATA code with 200 status", async () => {
        const airport = { id: 1, iataCode: "JFK", name: "John F Kennedy" };
        req.params.iataCode = "JFK";
        airportService.getAirportByIataCode.mockResolvedValue(airport);
  
        await getAirportByIataCode(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Airport fetched successfully",
          data: airport,
          error: null,
        });
      });
  
      test("should handle error when retrieving an airport by IATA code", async () => {
        const errorMessage = "Airport not found";
        req.params.iataCode = "JFK";
        airportService.getAirportByIataCode.mockRejectedValue(new Error(errorMessage));
  
        await getAirportByIataCode(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("updateAirport", () => {
      test("should update an airport and return 200 status", async () => {
        const updatedAirport = { id: 1, iataCode: "JFK", name: "Updated John F Kennedy" };
        req.params.iataCode = "JFK";
        req.body = { name: "Updated John F Kennedy" };
        airportService.updateAirport.mockResolvedValue(updatedAirport);
  
        await updateAirport(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Airport updated successfully",
          data: updatedAirport,
          error: null,
        });
      });
  
      test("should handle error when updating an airport", async () => {
        const errorMessage = "Failed to update airport";
        req.params.iataCode = "JFK";
        req.body = { name: "Updated John F Kennedy" };
        airportService.updateAirport.mockRejectedValue(new Error(errorMessage));
  
        await updateAirport(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("deleteAirport", () => {
      test("should delete an airport and return 200 status", async () => {
        const response = { message: "Airport deleted successfully" };
        req.params.iataCode = "JFK";
        airportService.deleteAirport.mockResolvedValue(response);
  
        await deleteAirport(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Airport deleted successfully",
          data: response,
          error: null,
        });
      });
  
      test("should handle error when deleting an airport", async () => {
        const errorMessage = "Failed to delete airport";
        req.params.iataCode = "JFK";
        airportService.deleteAirport.mockRejectedValue(new Error(errorMessage));
  
        await deleteAirport(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  });
  