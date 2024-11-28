import express from "express";
// import { getManyByUserId, create } from "../controllers/payment.js";
import { createByBankTransfer, createByCreditCard, notifications } from "../controllers/payment.controllers.js";

const router = express.Router();

// router.get("/", getManyByUserId);
router.post("/method/bank-transfer", createByBankTransfer);
router.post("/method/credit-card", createByCreditCard);
router.post("/notifications", notifications);
router.get("/views", (req, res) => {
    res.render('payment');
});

export default router;