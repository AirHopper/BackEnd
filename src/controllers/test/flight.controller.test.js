import {
    getAll,
    getById,
    store,
    update,
    destroy,
  } from "../flight.controller.js";
  import * as flightService from "../../services/flight.service.js";
  
  // Mock the flightService
  jest.mock("../../services/flight.service.js");
  
  describe("Flight Controller", () => {
    let req, res, next;
  
    beforeEach(() => {
      req = {
        body: {},
        params: {},
        query: {},
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
  
    describe("getAll", () => {
      test("should fetch all flights and return 200 status", async () => {
        const mockFlights = [
          { id: 1, route: "Route 1", price: 100 },
          { id: 2, route: "Route 2", price: 200 },
        ];
        const mockPagination = { page: 1, limit: 10, total: 2 };
        flightService.getAll.mockResolvedValue({
          formattedFlights: mockFlights,
          pagination: mockPagination,
        });
  
        req.query = { page: 1, limit: 10 };
  
        await getAll(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Flights fetched successfully",
          pagination: mockPagination,
          data: mockFlights,
        });
      });
  
      test("should handle error when fetching flights", async () => {
        const errorMessage = "Failed to fetch flights";
        flightService.getAll.mockRejectedValue(new Error(errorMessage));
  
        await getAll(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("getById", () => {
      test("should fetch flight by ID and return 200 status", async () => {
        const mockFlight = { id: 1, route: "Route 1", price: 100 };
        req.params.id = 1;
  
        flightService.getById.mockResolvedValue(mockFlight);
  
        await getById(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Flight fetched successfully",
          data: mockFlight,
        });
      });
  
      test("should handle error when fetching flight by ID", async () => {
        const errorMessage = "Flight not found";
        req.params.id = 1;
  
        flightService.getById.mockRejectedValue(new Error(errorMessage));
  
        await getById(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("store", () => {
      test("should create a flight and return 201 status", async () => {
        const mockFlight = { id: 1, route: "Route 1", price: 100 };
        req.body = { route: "Route 1", price: 100 };
  
        flightService.store.mockResolvedValue(mockFlight);
  
        await store(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Flight created successfully",
          data: mockFlight,
        });
      });
  
      test("should handle error when creating a flight", async () => {
        const errorMessage = "Failed to create flight";
        req.body = { route: "Route 1", price: 100 };
  
        flightService.store.mockRejectedValue(new Error(errorMessage));
  
        await store(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("update", () => {
      test("should update a flight and return 200 status", async () => {
        const mockUpdatedFlight = { id: 1, route: "Updated Route", price: 150 };
        req.params.id = 1;
        req.body = { route: "Updated Route", price: 150 };
  
        flightService.update.mockResolvedValue(mockUpdatedFlight);
  
        await update(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Flight updated successfully",
          data: mockUpdatedFlight,
        });
      });
  
      test("should handle error when updating a flight", async () => {
        const errorMessage = "Failed to update flight";
        req.params.id = 1;
        req.body = { route: "Updated Route", price: 150 };
  
        flightService.update.mockRejectedValue(new Error(errorMessage));
  
        await update(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("destroy", () => {
      test("should delete a flight and return 200 status", async () => {
        req.params.id = 1;
  
        flightService.destroy.mockResolvedValue({ message: "Flight deleted successfully" });
  
        await destroy(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Flight deleted successfully",
        });
      });
  
      test("should handle error when deleting a flight", async () => {
        const errorMessage = "Failed to delete flight";
        req.params.id = 1;
  
        flightService.destroy.mockRejectedValue(new Error(errorMessage));
  
        await destroy(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  });
  