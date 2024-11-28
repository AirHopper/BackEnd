import express from "express";
// import { getManyByUserId, create } from "../controllers/payment.js";
import { create } from "../controllers/payment.controllers.js";

const router = express.Router();

// router.get("/", getManyByUserId);
router.post("/", create);
router.get("/views", (req, res) => {
    res.render('payment');
});

export default router;