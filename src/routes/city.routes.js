import express from "express";
import { upload, checkMultipart } from "../middlewares/upload.js";
import * as cityController from "../controllers/city.controller.js";
import {
  validateCreateCity,
  validateUpdateCity,
} from "../middlewares/validator/city.validator.js";

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

// Update a city photo by code
router.put(
  "/:code/photo",
  checkMultipart,
  upload.single("image"),
  cityController.updateCityPhoto
);

// Delete a city by code
router.delete("/:code", cityController.deleteCity);

export default router;
