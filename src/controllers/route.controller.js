import * as routeService from "../services/route.service.js";

// Controller to create a new route
export const createRouteController = async (req, res, next) => {
  try {
    const newRoute = await routeService.createRoute(req.body);
    res.status(201).json({
      success: true,
      message: "Route created successfully",
      data: newRoute,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// Controller to get all routes
export const getRoutesController = async (req, res, next) => {
  try {
    const routes = await routeService.getRoutes();
    res.status(200).json({
      success: true,
      message: "Routes fetched successfully",
      data: routes,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// Controller to get a route by ID
export const getRouteController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const route = await routeService.getRoute(parseInt(id));
    res.status(200).json({
      success: true,
      message: "Route fetched successfully",
      data: route,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// Controller to update a route by ID
export const updateRouteController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedRoute = await routeService.updateRoute(parseInt(id), req.body);
    res.status(200).json({
      success: true,
      message: "Route updated successfully",
      data: updatedRoute,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// Controller to delete a route by ID
export const deleteRouteController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRoute = await routeService.deleteRoute(parseInt(id));
    res.status(200).json({
      success: true,
      message: "Route deleted successfully",
      data: deletedRoute,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
