import express from "express";
import * as cityController from "../controllers/city.controller.js";
import {
  validateCreateCity,
  validateUpdateCity,
} from "../middlewares/validator/city.validator.js";
import { upload, checkMultipart } from "../middlewares/upload.js";

const router = express.Router();

// Create a new city
router.post(
  "/",
  checkMultipart,
  upload.single("image"),
  validateCreateCity,
  cityController.createCity
);

// Get all cities
router.get("/", cityController.getAllCities);

// Get a city by code
router.get("/:code", cityController.getCityByCode);

// Update a city by code
router.put("/:code", validateUpdateCity, cityController.updateCity);

// Delete a city by code
router.delete("/:code", cityController.deleteCity);

export default router;
