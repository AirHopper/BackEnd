import express from "express";
import * as airplaneController from "../controllers/airplane.controller.js";
import {
  validateCreateAirplane,
  validateUpdateAirplane,
} from "../middlewares/validator/airplane.validator.js";
import { authHandler, adminHandler } from "../middlewares/authHandler.js";

const router = express.Router();

// Create an airplane
router.post("/",authHandler, adminHandler, validateCreateAirplane, airplaneController.createAirplane);

// Get all airplanes
router.get("/", airplaneController.getAllAirplanes);

// Get an airplane by ID
router.get("/:id", airplaneController.getAirplaneById);

// Update an airplane
router.put("/:id", authHandler, adminHandler, validateUpdateAirplane, airplaneController.updateAirplane);

// Delete an airplane
router.delete("/:id", authHandler, adminHandler, airplaneController.deleteAirplane);

export default router;
