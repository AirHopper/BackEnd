import {
    createTerminal,
    getAllTerminals,
    getTerminalById,
    updateTerminal,
    deleteTerminal,
  } from "../terminal.controller.js";
  import * as terminalService from "../../services/terminal.service.js";
  
  // Mock the terminalService
  jest.mock("../../services/terminal.service.js");
  
  describe("Terminal Controller", () => {
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
  
    describe("createTerminal", () => {
      test("should create a terminal and return 201 status", async () => {
        req.body = { name: "Terminal 1", type: "Domestic", airportId: "JFK" };
        const newTerminal = { id: 1, ...req.body };
  
        terminalService.createTerminal.mockResolvedValue(newTerminal);
  
        await createTerminal(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Terminal created successfully",
          data: newTerminal,
          error: null,
        });
      });
  
      test("should handle error when creating a terminal", async () => {
        const errorMessage = "Failed to create terminal";
        req.body = { name: "Terminal 1", type: "Domestic", airportId: "JFK" };
        terminalService.createTerminal.mockRejectedValue(new Error(errorMessage));
  
        await createTerminal(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("getAllTerminals", () => {
      test("should return all terminals with 200 status", async () => {
        const terminals = [
          { id: 1, name: "Terminal 1", type: "Domestic" },
          { id: 2, name: "Terminal 2", type: "International" },
        ];
        req.query.airportId = "123"; // Add query parameter to the existing mock
        terminalService.getAllTerminals.mockResolvedValue(terminals); // Mock service
    
        await getAllTerminals(req, res, next);
    
        expect(terminalService.getAllTerminals).toHaveBeenCalledWith("123"); // Ensure airportId is passed
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Terminals fetched successfully",
          data: terminals,
          error: null,
        });
      });
    
      test("should handle error when retrieving terminals", async () => {
        const errorMessage = "Failed to fetch terminals";
        req.query.airportId = "123"; // Add query parameter to the existing mock
        terminalService.getAllTerminals.mockRejectedValue(new Error(errorMessage)); // Mock service
    
        await getAllTerminals(req, res, next);
    
        expect(terminalService.getAllTerminals).toHaveBeenCalledWith("123"); // Ensure airportId is passed
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
    
  
    describe("getTerminalById", () => {
      test("should return a terminal by ID with 200 status", async () => {
        const terminal = { id: 1, name: "Terminal 1", type: "Domestic" };
        req.params.id = 1;
        terminalService.getTerminalById.mockResolvedValue(terminal);
  
        await getTerminalById(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Terminal fetched successfully",
          data: terminal,
          error: null,
        });
      });
  
      test("should handle error when retrieving a terminal by ID", async () => {
        const errorMessage = "Terminal not found";
        req.params.id = 1;
        terminalService.getTerminalById.mockRejectedValue(new Error(errorMessage));
  
        await getTerminalById(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("updateTerminal", () => {
      test("should update a terminal and return 200 status", async () => {
        const updatedTerminal = { id: 1, name: "Updated Terminal 1", type: "Domestic" };
        req.params.id = 1;
        req.body = { name: "Updated Terminal 1" };
        terminalService.updateTerminal.mockResolvedValue(updatedTerminal);
  
        await updateTerminal(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Terminal updated successfully",
          data: updatedTerminal,
          error: null,
        });
      });
  
      test("should handle error when updating a terminal", async () => {
        const errorMessage = "Failed to update terminal";
        req.params.id = 1;
        req.body = { name: "Updated Terminal 1" };
        terminalService.updateTerminal.mockRejectedValue(new Error(errorMessage));
  
        await updateTerminal(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("deleteTerminal", () => {
      test("should delete a terminal and return 200 status", async () => {
        const response = { message: "Terminal deleted successfully" };
        req.params.id = 1;
        terminalService.deleteTerminal.mockResolvedValue(response);
  
        await deleteTerminal(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Terminal deleted successfully",
          data: response,
          error: null,
        });
      });
  
      test("should handle error when deleting a terminal", async () => {
        const errorMessage = "Failed to delete terminal";
        req.params.id = 1;
        terminalService.deleteTerminal.mockRejectedValue(new Error(errorMessage));
  
        await deleteTerminal(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  });
  