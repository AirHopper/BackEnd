import express from "express";
import { getManyByUserId, createByBank } from "../controllers/ticket.controller.js";

const router = express.Router();

router.get("/", getManyByUserId);
router.post("/", createByBank);

export default router;