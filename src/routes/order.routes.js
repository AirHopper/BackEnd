import express from "express";
import { getManyByUserId, createByBank, createByCreditCard } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", getManyByUserId);
router.post("/method/bank-va", createByBank);
router.post("/method/credit-card", createByCreditCard);

export default router;