import express from "express";
import { upload, checkMultipart } from "../middlewares/upload.js";
import * as cityController from "../controllers/city.controller.js";
import {
  validateCreateCity,
  validateUpdateCity,
} from "../middlewares/validator/city.validator.js";
import { authHandler, adminHandler } from "../middlewares/authHandler.js";

const router = express.Router();

// Create a new city
router.post(
  "/",
  authHandler,
  adminHandler,
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
router.put(
  "/:code",
  authHandler,
  adminHandler,
  validateUpdateCity,
  cityController.updateCity
);

// Update a city photo by code
router.put(
  "/:code/photo",
  authHandler,
  adminHandler,
  checkMultipart,
  upload.single("image"),
  cityController.updateCityPhoto
);

// Delete a city by code
router.delete("/:code", authHandler, adminHandler, cityController.deleteCity);

export default router;
