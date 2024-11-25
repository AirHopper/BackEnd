import express from "express";
import { getAll, getById, create, update } from "../controllers/flightController.js";

const router = express.Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.patch("/:id", update);

export default router;
