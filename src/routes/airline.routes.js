import express from "express";
import { upload, checkMultipart } from "../middlewares/upload.js";
import * as airlineController from "../controllers/airline.controller.js";
import {
  validateCreateAirline,
  validateUpdateAirline,
} from "../middlewares/validator/airline.validator.js";

const router = express.Router();

// Create a new airline
router.post(
  "/",
  checkMultipart,
  upload.single("image"),
  validateCreateAirline,
  airlineController.createAirline
);

// Get all airlines
router.get("/", airlineController.getAllAirlines);

// Get a single airline by IATA code
router.get("/:iataCode", airlineController.getAirlineById);

// Update airline details
router.put(
  "/:iataCode",
  validateUpdateAirline,
  airlineController.updateAirlineDetails
);

// Update airline photo
router.put(
  "/:iataCode/photo",
  checkMultipart,
  upload.single("image"),
  airlineController.updateAirlinePhoto
);

// Delete an airline
router.delete("/:iataCode", airlineController.deleteAirline);

export default router;
