import express from "express";
import * as discountController from "../controllers/discount.controller.js";
import {
  validateCreateDiscount,
  validateUpdateDiscount,
} from "../middlewares/validator/discount.validator.js";
import { adminHandler, authHandler } from "../middlewares/authHandler.js";

const router = express.Router();

// Create a discount
router.post("/", authHandler, adminHandler, validateCreateDiscount, discountController.createDiscount);

// Get all discounts
router.get("/", authHandler, adminHandler, discountController.getAllDiscounts);

// Get a discount by ID
router.get("/:id", authHandler, adminHandler, discountController.getDiscountById);

// Update a discount
router.put("/:id", authHandler, adminHandler, validateUpdateDiscount, discountController.updateDiscount);

// Delete a discount
router.delete("/:id", authHandler, adminHandler, discountController.deleteDiscount);

export default router;
