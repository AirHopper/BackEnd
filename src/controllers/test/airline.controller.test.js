import {
    createAirline,
    getAllAirlines,
    getSevenRandomAirlines,
    getAirlineById,
    updateAirlineDetails,
    updateAirlinePhoto,
    deleteAirline,
  } from "../airline.controller.js";
  import * as airlineService from "../../services/airline.service.js";
  
  // Mock the airlineService
  jest.mock("../../services/airline.service.js");
  
  describe("Airline Controller", () => {
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
  
    describe("createAirline", () => {
      test("should create an airline and return 201 status", async () => {
        req.body = { name: "New Airline", iataCode: "NA" };
        req.file = { buffer: Buffer.from("file content"), originalname: "airline.jpg" };
        const newAirline = { id: 1, ...req.body };
  
        airlineService.createAirline.mockResolvedValue(newAirline);
  
        await createAirline(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Airline created successfully",
          data: newAirline,
          error: null,
        });
      });
  
      test("should return 400 if no file is provided", async () => {
        req.body = { name: "New Airline", iataCode: "NA" };
  
        await createAirline(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Please upload a airline image" });
      });
  
      test("should handle error when creating an airline", async () => {
        const errorMessage = "Failed to create airline";
        req.file = { buffer: Buffer.from("file content"), originalname: "airline.jpg" };
        airlineService.createAirline.mockRejectedValue(new Error(errorMessage));
  
        await createAirline(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("getAllAirlines", () => {
      test("should return all airlines with 200 status", async () => {
        const airlines = [
          { id: 1, name: "Airline 1", iataCode: "A1" },
          { id: 2, name: "Airline 2", iataCode: "A2" },
        ];
        airlineService.getAllAirlines.mockResolvedValue(airlines);
  
        await getAllAirlines(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Airlines fetched successfully",
          data: airlines,
          error: null,
        });
      });
  
      test("should handle error when retrieving airlines", async () => {
        const errorMessage = "Failed to fetch airlines";
        airlineService.getAllAirlines.mockRejectedValue(new Error(errorMessage));
  
        await getAllAirlines(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });

    describe("getSevenRandomAirlines", () => {
      test("should return seven random airlines logo with 200 status", async () => {
        const randomAirlines = [
          { id: 1, name: "Airline 1", logo: "logo1.jpg" },
          { id: 2, name: "Airline 2", logo: "logo2.jpg" },
          { id: 3, name: "Airline 3", logo: "logo3.jpg" },
          { id: 4, name: "Airline 4", logo: "logo4.jpg" },
          { id: 5, name: "Airline 5", logo: "logo5.jpg" },
          { id: 6, name: "Airline 6", logo: "logo6.jpg" },
          { id: 7, name: "Airline 7", logo: "logo7.jpg" },
        ];
    
        airlineService.getSevenRandomAirlines.mockResolvedValue(randomAirlines);
    
        await getSevenRandomAirlines(req, res, next);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Airlines logo fetched successfully",
          data: randomAirlines,
          error: null,
        });
      });
    
      test("should handle error when fetching seven random airlines logo", async () => {
        const errorMessage = "Failed to fetch airlines logo";
        airlineService.getSevenRandomAirlines.mockRejectedValue(new Error(errorMessage));
    
        await getSevenRandomAirlines(req, res, next);
    
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
    
  
    describe("getAirlineById", () => {
      test("should return an airline by IATA code with 200 status", async () => {
        const airline = { id: 1, name: "Airline 1", iataCode: "A1" };
        req.params.iataCode = "A1";
        airlineService.getAirlineById.mockResolvedValue(airline);
  
        await getAirlineById(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Airline fetched successfully",
          data: airline,
          error: null,
        });
      });
  
      test("should handle error when retrieving an airline by IATA code", async () => {
        const errorMessage = "Airline not found";
        req.params.iataCode = "A1";
        airlineService.getAirlineById.mockRejectedValue(new Error(errorMessage));
  
        await getAirlineById(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("updateAirlineDetails", () => {
      test("should update an airline and return 200 status", async () => {
        const updatedAirline = { id: 1, name: "Updated Airline", iataCode: "UA123" };
        req.params.iataCode = "UA123";
        req.body = { name: "Updated Airline" };
        airlineService.updateAirlineDetails.mockResolvedValue(updatedAirline);
  
        await updateAirlineDetails(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Airline details updated successfully",
          data: updatedAirline,
          error: null,
        });
      });
  
      test("should handle error when updating an airline", async () => {
        const errorMessage = "Failed to update airline";
        req.params.iataCode = "UA123";
        req.body = { name: "Updated Airline" };
        airlineService.updateAirlineDetails.mockRejectedValue(new Error(errorMessage));
  
        await updateAirlineDetails(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("updateAirlinePhoto", () => {
      test("should update an airline photo and return 200 status", async () => {
        const updatedAirline = { id: 1, name: "Airline", photo: "newPhoto.jpg" };
        req.params.iataCode = "A1";
        req.file = { buffer: Buffer.from("file content"), originalname: "newPhoto.jpg" };
        airlineService.updateAirlinePhoto.mockResolvedValue(updatedAirline);
  
        await updateAirlinePhoto(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: "Airline photo updated successfully",
          data: updatedAirline,
        });
      });
  
      test("should handle error when updating an airline photo", async () => {
        const errorMessage = "Failed to update airline photo";
        req.params.iataCode = "A1";
        req.file = { buffer: Buffer.from("file content"), originalname: "newPhoto.jpg" };
        airlineService.updateAirlinePhoto.mockRejectedValue(new Error(errorMessage));
  
        await updateAirlinePhoto(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("deleteAirline", () => {
      test("should delete an airline and return 200 status", async () => {
        const response = { message: "Airline deleted successfully" };
        req.params.iataCode = "A1";
        airlineService.deleteAirline.mockResolvedValue(response);
  
        await deleteAirline(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: response.message });
      });
  
      test("should handle error when deleting an airline", async () => {
        const errorMessage = "Failed to delete airline";
        req.params.iataCode = "A1";
        airlineService.deleteAirline.mockRejectedValue(new Error(errorMessage));
  
        await deleteAirline(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  });
  