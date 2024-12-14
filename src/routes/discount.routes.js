import express from "express";
import * as discountController from "../controllers/discount.controller.js";
import {
  validateCreateDiscount,
  validateUpdateDiscount,
} from "../middlewares/validator/discount.validator.js";

const router = express.Router();

// Create a discount
router.post("/", validateCreateDiscount, discountController.createDiscount);

// Get all discounts
router.get("/", discountController.getAllDiscounts);

// Get a discount by ID
router.get("/:id", discountController.getDiscountById);

// Update a discount
router.put("/:id", validateUpdateDiscount, discountController.updateDiscount);

// Delete a discount
router.delete("/:id", discountController.deleteDiscount);

export default router;
