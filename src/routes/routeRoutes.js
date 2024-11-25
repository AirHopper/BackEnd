import express from "express";
import {
  createRouteController,
  getRoutesController,
  getRouteController,
  updateRouteController,
  deleteRouteController,
} from "../controllers/routeControllers.js";

const router = express.Router();

router.post("/", createRouteController); // Create a new route
router.get("/", getRoutesController); // Get paginated routes
router.get("/:id", getRouteController); // Get a specific route by ID
router.put("/:id", updateRouteController); // Update a specific route
router.delete("/:id", deleteRouteController); // Delete a specific route

export default router;
