import express from "express";
import { getAll, getById, create, update, destroy } from "../controllers/flightController.js";

const router = express.Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", destroy);

export default router;
