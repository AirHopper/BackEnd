import express from "express";
import { getAll, getById, store, update, destroy } from "../controllers/flight.controllers.js";

const router = express.Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", store);
router.patch("/:id", update);
router.delete("/:id", destroy);

export default router;
