import express from "express";
import * as airportController from "../controllers/airport.controller.js";
import {
  validateCreateAirport,
  validateUpdateAirport,
} from "../middlewares/validator/airport.validator.js";
import { adminHandler, authHandler } from "../middlewares/authHandler.js";

const router = express.Router();

// Create an airport
router.post("/", authHandler, adminHandler, validateCreateAirport, airportController.createAirport);

// Get all airports
router.get("/", airportController.getAllAirports);

// Get an airport by IATA code
router.get("/:iataCode", airportController.getAirportByIataCode);

// Update an airport
router.put(
  "/:iataCode",
  authHandler,
  adminHandler,
  validateUpdateAirport,
  airportController.updateAirport
);

// Delete an airport
router.delete("/:iataCode", authHandler, adminHandler, airportController.deleteAirport);

export default router;
