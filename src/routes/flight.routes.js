import express from "express";
import * as flightController from "../controllers/flight.controller.js";

const router = express.Router();

router.get("/", flightController.getAll);
router.get("/:id", flightController.getById);
router.post("/", flightController.store);
router.patch("/:id", flightController.update);
router.delete("/:id", flightController.destroy);

export default router;
