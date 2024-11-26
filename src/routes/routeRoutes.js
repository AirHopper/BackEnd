import express from "express";
import {
  createRouteController,
  getRoutesController,
  getRouteController,
  updateRouteController,
  deleteRouteController,
} from "../controllers/routeControllers.js";
import {
  validateCreateRoute,
  validateUpdateRoute,
} from "../middlewares/validator/routeValidator.js";

const router = express.Router();

router.post("/", validateCreateRoute, createRouteController); // Create a new route
router.get("/", getRoutesController); // Get paginated routes
router.get("/:id", getRouteController); // Get a specific route by ID
router.put("/:id", validateUpdateRoute, updateRouteController); // Update a specific route
router.delete("/:id", deleteRouteController); // Delete a specific route

export default router;
