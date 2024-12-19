import express from "express";
import * as cityController from "../controllers/route.controller.js";
import {
  validateCreateRoute,
  validateUpdateRoute,
} from "../middlewares/validator/route.validator.js";
import { adminHandler, authHandler } from "../middlewares/authHandler.js";

const router = express.Router();

// Create a new route
router.post(
  "/",
  authHandler,
  adminHandler,
  validateCreateRoute,
  cityController.createRouteController
);

// Get paginated routes
router.get("/", cityController.getRoutesController);

// Get a specific route by ID
router.get("/:id", cityController.getRouteController);

// Get a specific route by airports
router.get(
  "/:departureAirportId/:arrivalAirportId",
  cityController.getRouteByAirportsController
);

// Update a specific route
router.put(
  "/:id",
  authHandler,
  adminHandler,
  validateUpdateRoute,
  cityController.updateRouteController
);

// Delete a specific route
router.delete(
  "/:id",
  authHandler,
  adminHandler,
  cityController.deleteRouteController
);

export default router;
