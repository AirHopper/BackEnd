import {
    createRouteController,
    getRoutesController,
    getRouteController,
    updateRouteController,
    deleteRouteController,
  } from "../route.controller.js";
  import * as routeService from "../../services/route.service.js";
  
  jest.mock("../../services/route.service.js");
  
  describe("Route Controller", () => {
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
  
    describe("createRouteController", () => {
      test("should create a route and return 201 status", async () => {
        req.body = { departureAirportId: "JFK", arrivalAirportId: "LAX", distance: 3983.2 };
        const newRoute = { id: 1, ...req.body };
  
        routeService.createRoute.mockResolvedValue(newRoute);
  
        await createRouteController(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Route created successfully",
          data: newRoute,
          error: null,
        });
      });
  
      test("should handle error when creating a route", async () => {
        const errorMessage = "Failed to create route";
        routeService.createRoute.mockRejectedValue(new Error(errorMessage));
  
        await createRouteController(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("getRoutesController", () => {
      test("should return all routes with 200 status", async () => {
        const routes = [
          { id: 1, departureAirportId: "JFK", arrivalAirportId: "LAX", distance: 3983.2 },
          { id: 2, departureAirportId: "SFO", arrivalAirportId: "ORD", distance: 2964.1 },
        ];
        routeService.getRoutes.mockResolvedValue(routes);
  
        await getRoutesController(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Routes fetched successfully",
          data: routes,
          error: null,
        });
      });
  
      test("should handle error when retrieving routes", async () => {
        const errorMessage = "Failed to fetch routes";
        routeService.getRoutes.mockRejectedValue(new Error(errorMessage));
  
        await getRoutesController(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("getRouteController", () => {
      test("should return a route by ID with 200 status", async () => {
        const route = { id: 1, departureAirportId: "JFK", arrivalAirportId: "LAX", distance: 3983.2 };
        req.params.id = 1;
        routeService.getRoute.mockResolvedValue(route);
  
        await getRouteController(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Route fetched successfully",
          data: route,
          error: null,
        });
      });
  
      test("should handle error when retrieving a route by ID", async () => {
        const errorMessage = "Route not found";
        req.params.id = 1;
        routeService.getRoute.mockRejectedValue(new Error(errorMessage));
  
        await getRouteController(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("updateRouteController", () => {
      test("should update a route and return 200 status", async () => {
        const updatedRoute = { id: 1, departureAirportId: "JFK", arrivalAirportId: "ORD", distance: 1182.6 };
        req.params.id = 1;
        req.body = { arrivalAirportId: "ORD" };
        routeService.updateRoute.mockResolvedValue(updatedRoute);
  
        await updateRouteController(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Route updated successfully",
          data: updatedRoute,
          error: null,
        });
      });
  
      test("should handle error when updating a route", async () => {
        const errorMessage = "Failed to update route";
        req.params.id = 1;
        req.body = { arrivalAirportId: "ORD" };
        routeService.updateRoute.mockRejectedValue(new Error(errorMessage));
  
        await updateRouteController(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  
    describe("deleteRouteController", () => {
      test("should delete a route and return 200 status", async () => {
        const response = { message: "Route deleted successfully" };
        req.params.id = 1;
        routeService.deleteRoute.mockResolvedValue(response);
  
        await deleteRouteController(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Route deleted successfully",
          data: response,
          error: null,
        });
      });
  
      test("should handle error when deleting a route", async () => {
        const errorMessage = "Failed to delete route";
        req.params.id = 1;
        routeService.deleteRoute.mockRejectedValue(new Error(errorMessage));
  
        await deleteRouteController(req, res, next);
  
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: errorMessage }));
      });
    });
  });
  