import express from "express";
import { create } from "../controllers/paymentWebhookLog.js";

const router = express.Router();

router.post("/", create);

export default router;