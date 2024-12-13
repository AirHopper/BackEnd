import express from "express";
import { notifications } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/notifications", notifications);

export default router;