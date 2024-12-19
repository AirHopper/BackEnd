import express from "express";
import { upload, checkMultipart } from "../middlewares/upload.js";
import { authHandler, adminHandler } from "../middlewares/authHandler.js";
import * as airlineController from "../controllers/airline.controller.js";
import {
  validateCreateAirline,
  validateUpdateAirline,
} from "../middlewares/validator/airline.validator.js";

const router = express.Router();

// Create a new airline
router.post(
  "/",
  authHandler,
  adminHandler,
  checkMultipart,
  upload.single("image"),
  validateCreateAirline,
  airlineController.createAirline
);

// Get all airlines
router.get("/", airlineController.getAllAirlines);

// Get 7 random airlines logo for home page
router.get("/randomLogo", airlineController.getSevenRandomAirlines);

// Get a single airline by IATA code
router.get("/:iataCode", airlineController.getAirlineById);

// Update airline details
router.put(
  "/:iataCode",
  authHandler,
  adminHandler,
  validateUpdateAirline,
  airlineController.updateAirlineDetails
);

// Update airline photo
router.put(
  "/:iataCode/photo",
  authHandler,
  adminHandler,
  checkMultipart,
  upload.single("image"),
  airlineController.updateAirlinePhoto
);

// Delete an airline
router.delete(
  "/:iataCode",
  authHandler,
  adminHandler,
  airlineController.deleteAirline
);

export default router;
