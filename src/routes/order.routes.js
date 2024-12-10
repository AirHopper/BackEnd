import express from "express";
import { getAllUserOwned, createByBank, createByCreditCard, getUserOwnedById, cancelUserOwnedById } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", getAllUserOwned);
router.get("/:id", getUserOwnedById); // beware it may overwrite below GET route
router.patch("/:id", cancelUserOwnedById);
router.post("/method/bank-va", createByBank);
router.post("/method/credit-card", createByCreditCard);

export default router;