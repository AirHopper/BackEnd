import express from "express";
import * as flightController from "../controllers/flight.controller.js";

import { validateCreateFlight, validateUpdateFlight } from "../middlewares/validator/flight.validator.js";
const router = express.Router();

router.get("/", flightController.getAll);
router.get("/:id", flightController.getById);
router.post("/", validateCreateFlight, flightController.store);
router.patch("/:id", validateUpdateFlight, flightController.update);
router.delete("/:id", flightController.destroy);

export default router;
