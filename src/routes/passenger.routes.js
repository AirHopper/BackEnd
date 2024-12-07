import express from "express";
import { createByBank } from "../controllers/passenger.controller.js";

const router = express.Router();

router.post("/", createByBank);

export default router;