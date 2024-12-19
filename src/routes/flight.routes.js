import express from "express";
import * as flightController from "../controllers/flight.controller.js";
import { validateCreateFlight } from "../middlewares/validator/flight.validator.js";
import { adminHandler, authHandler } from "../middlewares/authHandler.js";
const router = express.Router();

router.get("/", flightController.getAll);
router.get("/:id", flightController.getById);
router.post("/", authHandler, adminHandler, validateCreateFlight, flightController.store);
router.delete("/:id", authHandler, adminHandler, flightController.destroy);

export default router;
