import {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  deleteRoute,
} from "../services/route.service.js";

// Controller to create a new route
export const createRouteController = async (req, res, next) => {
  try {
    const newRoute = await createRoute(req.body);
    res.status(201).json({
      message: "Route created successfully",
      data: newRoute,
    });
  } catch (error) {
    next(error);
  }
};

// Controller to get all routes
export const getRoutesController = async (req, res, next) => {
  try {
    const { page, pageSize } = req.query;
    const routes = await getRoutes({ page, pageSize });
    res.status(200).json({
      message: "Routes fetched successfully",
      metadata: routes.metadata,
      data: routes.routes,
    });
  } catch (error) {
    next(error);
  }
};

// Controller to get a route by ID
export const getRouteController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const route = await getRoute(parseInt(id));
    res.status(200).json({
      message: "Route fetched successfully",
      data: route,
    });
  } catch (error) {
    next(error);
  }
};

// Controller to update a route by ID
export const updateRouteController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedRoute = await updateRoute(parseInt(id), req.body);
    res.status(200).json({
      message: "Route updated successfully",
      data: updatedRoute,
    });
  } catch (error) {
    next(error);
  }
};

// Controller to delete a route by ID
export const deleteRouteController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRoute = await deleteRoute(parseInt(id));
    res.status(200).json({
      message: "Route deleted successfully",
      data: deletedRoute,
    });
  } catch (error) {
    next(error);
  }
};
