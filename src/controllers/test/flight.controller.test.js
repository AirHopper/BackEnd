import {
  getAll,
  getById,
  store,
  destroy,
} from "../flight.controller.js";
import * as flightService from "../../services/flight.service.js";

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
    test("should return all flights with pagination and 200 status", async () => {
      const flights = [{ id: 1, name: "Flight 1" }, { id: 2, name: "Flight 2" }];
      const pagination = { total: 2, page: 1, limit: 10 };
      flightService.getAll.mockResolvedValue({
        formattedFlights: flights,
        pagination,
      });

      await getAll(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Flights fetched successfully",
        pagination,
        data: flights,
      });
    });

    test("should handle errors when fetching flights", async () => {
      const errorMessage = "Failed to fetch flights";
      flightService.getAll.mockRejectedValue(new Error(errorMessage));

      await getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: errorMessage })
      );
    });
  });

  describe("getById", () => {
    test("should return a flight by ID with 200 status", async () => {
      const flight = { id: 1, name: "Flight 1" };
      req.params.id = "1";
      flightService.getById.mockResolvedValue(flight);

      await getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Flight fetched successfully",
        data: flight,
      });
    });

    test("should handle errors when fetching a flight by ID", async () => {
      const errorMessage = "Flight not found";
      req.params.id = "1";
      flightService.getById.mockRejectedValue(new Error(errorMessage));

      await getById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: errorMessage })
      );
    });
  });

  describe("store", () => {
    test("should create a flight and return 201 status", async () => {
      const flightData = { name: "New Flight", airlineId: 1 };
      const newFlight = { id: 1, ...flightData };
      req.body = flightData;
      flightService.store.mockResolvedValue(newFlight);

      await store(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Flight created successfully",
        data: newFlight,
      });
    });

    test("should handle errors when creating a flight", async () => {
      const errorMessage = "Failed to create flight";
      req.body = { name: "New Flight" };
      flightService.store.mockRejectedValue(new Error(errorMessage));

      await store(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: errorMessage })
      );
    });
  });

  describe("destroy", () => {
    test("should delete a flight and return 200 status", async () => {
      req.params.id = "1";
      flightService.destroy.mockResolvedValue();

      await destroy(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Flight deleted successfully",
      });
    });

    test("should handle errors when deleting a flight", async () => {
      const errorMessage = "Failed to delete flight";
      req.params.id = "1";
      flightService.destroy.mockRejectedValue(new Error(errorMessage));

      await destroy(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: errorMessage })
      );
    });
  });
});
