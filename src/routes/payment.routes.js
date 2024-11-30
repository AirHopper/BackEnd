import express from "express";
import { createByBankTransfer, createByCreditCard, notifications } from "../controllers/payment.controller.js";

const router = express.Router();

// router.get("/", getManyByUserId);
router.post("/method/bank-transfer", createByBankTransfer);
router.post("/method/credit-card", createByCreditCard);
router.post("/notifications", notifications);

export default router;