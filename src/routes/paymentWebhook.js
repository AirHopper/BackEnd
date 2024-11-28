import express from "express";
import { notification } from "../controllers/paymentWebhook.js";

const router = express.Router();

router.post("/", notification);

export default router;