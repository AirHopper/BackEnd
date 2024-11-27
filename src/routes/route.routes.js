import express from "express";
import * as cityController from "../controllers/route.controller.js";
import {
  validateCreateRoute,
  validateUpdateRoute,
} from "../middlewares/validator/route.validator.js";

const router = express.Router();

// Create a new route
router.post("/", validateCreateRoute, cityController.createRouteController);

// Get paginated routes
router.get("/", cityController.getRoutesController);

// Get a specific route by ID
router.get("/:id", cityController.getRouteController);

// Update a specific route
router.put("/:id", validateUpdateRoute, cityController.updateRouteController);

// Delete a specific route
router.delete("/:id", cityController.deleteRouteController);

export default router;
