import {
  createAirplane,
  getAllAirplanes,
  getAirplaneById,
  updateAirplane,
  deleteAirplane,
} from "../airplane.controller.js";
import * as airplaneService from "../../services/airplane.service.js";

// Mock the airplaneService
jest.mock("../../services/airplane.service.js");

describe("Airplane Controller", () => {
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

  describe("createAirplane", () => {
    test("should create an airplane and return 201 status", async () => {
      req.body = { model: "Boeing 747", capacity: 660 };
      const newAirplane = { id: 1, ...req.body };

      airplaneService.createAirplane.mockResolvedValue(newAirplane);

      await createAirplane(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Airplane created successfully",
        data: newAirplane,
        error: null,
      });
    });

    test("should handle error when creating an airplane", async () => {
      const errorMessage = "Failed to create airplane";
      req.body = { model: "Boeing 747", capacity: 660 };
      airplaneService.createAirplane.mockRejectedValue(new Error(errorMessage));

      await createAirplane(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: errorMessage })
      );
    });
  });

  describe("getAllAirplanes", () => {
    test("should return all airplanes with 200 status", async () => {
      const airplanes = [
        { id: 1, model: "Airbus A380", capacity: 853 },
        { id: 2, model: "Boeing 747", capacity: 660 },
      ];
      airplaneService.getAllAirplanes.mockResolvedValue(airplanes);

      await getAllAirplanes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Airplanes fetched successfully",
        data: airplanes,
        error: null,
      });
    });

    test("should return filtered airplanes by airlineId with 200 status", async () => {
      const airlineId = "5";
      req.query.airlineId = airlineId;
      const airplanes = [
        { id: 1, model: "Boeing 747", capacity: 660, airlineId: 5 },
      ];
      airplaneService.getAllAirplanes.mockResolvedValue(airplanes);

      await getAllAirplanes(req, res, next);

      expect(airplaneService.getAllAirplanes).toHaveBeenCalledWith(airlineId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Airplanes fetched successfully",
        data: airplanes,
        error: null,
      });
    });

    test("should handle error when retrieving airplanes", async () => {
      const errorMessage = "Failed to fetch airplanes";
      airplaneService.getAllAirplanes.mockRejectedValue(
        new Error(errorMessage)
      );

      await getAllAirplanes(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: errorMessage })
      );
    });
  });

  describe("getAirplaneById", () => {
    test("should return an airplane by ID with 200 status", async () => {
      const airplane = { id: 1, model: "Boeing 747", capacity: 660 };
      req.params.id = "1";
      airplaneService.getAirplaneById.mockResolvedValue(airplane);

      await getAirplaneById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Airplane fetched successfully",
        data: airplane,
        error: null,
      });
    });

    test("should handle error when retrieving an airplane by ID", async () => {
      const errorMessage = "Airplane not found";
      req.params.id = "1";
      airplaneService.getAirplaneById.mockRejectedValue(
        new Error(errorMessage)
      );

      await getAirplaneById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: errorMessage })
      );
    });
  });

  describe("updateAirplane", () => {
    test("should update an airplane and return 200 status", async () => {
      const updatedAirplane = {
        id: 1,
        model: "Updated Boeing 747",
        capacity: 700,
      };
      req.params.id = "1";
      req.body = { model: "Updated Boeing 747", capacity: 700 };
      airplaneService.updateAirplane.mockResolvedValue(updatedAirplane);

      await updateAirplane(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Airplane updated successfully",
        data: updatedAirplane,
        error: null,
      });
    });

    test("should handle error when updating an airplane", async () => {
      const errorMessage = "Failed to update airplane";
      req.params.id = "1";
      req.body = { model: "Updated Boeing 747", capacity: 700 };
      airplaneService.updateAirplane.mockRejectedValue(new Error(errorMessage));

      await updateAirplane(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: errorMessage })
      );
    });
  });

  describe("deleteAirplane", () => {
    test("should delete an airplane and return 200 status", async () => {
      const response = { message: "Airplane deleted successfully" };
      req.params.id = "1";
      airplaneService.deleteAirplane.mockResolvedValue(response);

      await deleteAirplane(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Airplane deleted successfully",
        data: response,
        error: null,
      });
    });

    test("should handle error when deleting an airplane", async () => {
      const errorMessage = "Failed to delete airplane";
      req.params.id = "1";
      airplaneService.deleteAirplane.mockRejectedValue(new Error(errorMessage));

      await deleteAirplane(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: errorMessage })
      );
    });
  });
});
