import express from "express";
import * as airplaneController from "../controllers/airplane.controller.js";
import {
  validateCreateAirplane,
  validateUpdateAirplane,
} from "../middlewares/validator/airplane.validator.js";

const router = express.Router();

// Create an airplane
router.post("/", validateCreateAirplane, airplaneController.createAirplane);

// Get all airplanes
router.get("/", airplaneController.getAllAirplanes);

// Get an airplane by ID
router.get("/:id", airplaneController.getAirplaneById);

// Update an airplane
router.put("/:id", validateUpdateAirplane, airplaneController.updateAirplane);

// Delete an airplane
router.delete("/:id", airplaneController.deleteAirplane);

export default router;
