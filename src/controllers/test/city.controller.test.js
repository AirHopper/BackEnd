import {
    createCity,
    getAllCities,
    getCityByCode,
    updateCity,
    updateCityPhoto,
    deleteCity,
  } from "../city.controller.js";
  import * as cityService from "../../services/city.service.js";
  
  // Mock the cityService
  jest.mock("../../services/city.service.js");
  
  describe("City Controller", () => {
    let req, res, next;
  
    beforeEach(() => {
      req = {
        body: {},
        params: {},
        file: null,
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
  
    describe("createCity", () => {
      test("should create a city and return 201 status", async () => {
        req.body = { name: "New City", code: "NYC" };
        req.file = { buffer: Buffer.from("file content"), originalname: "city.jpg" };
        const newCity = { id: 1, ...req.body };
  
        cityService.createCity.mockResolvedValue(newCity);
  
        await createCity(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "City created successfully",
          data: newCity,
          error: null,
        });
      });
  
      test("should return 400 if no file is provided", async () => {
        req.body = { name: "New City", code: "NC123" };
  
        await createCity(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Please upload a city image" });
      });
  
      test("should handle error when creating a city", async () => {
        const errorMessage = "Failed to create city";
        req.file = { buffer: Buffer.from("file content"), originalname: "city.jpg" };
        cityService.createCity.mockRejectedValue(new Error(errorMessage));
  
        await createCity(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("getAllCities", () => {
      test("should return all cities with 200 status", async () => {
        const cities = [
          { id: 1, name: "City 1", code: "C1" },
          { id: 2, name: "City 2", code: "C2" },
        ];
        cityService.getAllCities.mockResolvedValue(cities);
  
        await getAllCities(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Cities fetched successfully",
          data: cities,
          error: null,
        });
      });
  
      test("should handle error when retrieving cities", async () => {
        const errorMessage = "Failed to fetch cities";
        cityService.getAllCities.mockRejectedValue(new Error(errorMessage));
  
        await getAllCities(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("getCityByCode", () => {
      test("should return a city by code with 200 status", async () => {
        const city = { id: 1, name: "City 1", code: "C1" };
        req.params.code = "C1";
        cityService.getCityByCode.mockResolvedValue(city);
  
        await getCityByCode(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "City fetched successfully",
          data: city,
          error: null,
        });
      });
  
      test("should handle error when retrieving a city by code", async () => {
        const errorMessage = "City not found";
        req.params.code = "C1";
        cityService.getCityByCode.mockRejectedValue(new Error(errorMessage));
  
        await getCityByCode(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("updateCity", () => {
      test("should update a city and return 200 status", async () => {
        const updatedCity = { id: 1, name: "Updated City", code: "UC123" };
        req.params.code = "UC123";
        req.body = { name: "Updated City" };
        cityService.updateCity.mockResolvedValue(updatedCity);
  
        await updateCity(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "City updated successfully",
          data: updatedCity,
          error: null,
        });
      });
  
      test("should handle error when updating a city", async () => {
        const errorMessage = "Failed to update city";
        req.params.code = "UC123";
        req.body = { name: "Updated City" };
        cityService.updateCity.mockRejectedValue(new Error(errorMessage));
  
        await updateCity(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("updateCityPhoto", () => {
      test("should update a city photo and return 200 status", async () => {
        const updatedCity = { id: 1, name: "City", photo: "newPhoto.jpg" };
        req.params.code = "C1";
        req.file = { buffer: Buffer.from("file content"), originalname: "newPhoto.jpg" };
        cityService.updateCityPhoto.mockResolvedValue(updatedCity);
  
        await updateCityPhoto(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "City photo updated successfully",
          data: updatedCity,
          error: null,
        });
      });
  
      test("should handle error when updating a city photo", async () => {
        const errorMessage = "Failed to update city photo";
        req.params.code = "C1";
        req.file = { buffer: Buffer.from("file content"), originalname: "newPhoto.jpg" };
        cityService.updateCityPhoto.mockRejectedValue(new Error(errorMessage));
  
        await updateCityPhoto(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("deleteCity", () => {
      test("should delete a city and return 200 status", async () => {
        const deletedCity = { id: 1, name: "City 1", code: "C1" };
        req.params.code = "C1";
        cityService.deleteCity.mockResolvedValue(deletedCity);
  
        await deleteCity(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "City deleted successfully",
          data: deletedCity,
          error: null,
        });
      });
  
      test("should handle error when deleting a city", async () => {
        const errorMessage = "Failed to delete city";
        req.params.code = "C1";
        cityService.deleteCity.mockRejectedValue(new Error(errorMessage));
  
        await deleteCity(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  });
  