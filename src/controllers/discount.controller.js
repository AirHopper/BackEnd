import * as discountService from "../services/discount.service.js";

// Create a new discount
export const createDiscount = async (req, res, next) => {
  try {
    const discount = await discountService.createDiscount(req.body);
    res.status(201).json({ 
      success: true, 
      message: "Discount created successfully", 
      data: discount, 
      error: null 
    });
  } catch (error) {
    next(error);
  }
};

// Get all discounts
export const getAllDiscounts = async (req, res, next) => {
  try {
    const discounts = await discountService.getAllDiscounts();
    res.status(200).json({ 
      success: true, 
      message: "Discounts fetched successfully", 
      data: discounts, 
      error: null 
    });
  } catch (error) {
    next(error);
  }
};

// Get a discount by ID
export const getDiscountById = async (req, res, next) => {
  try {
    const discount = await discountService.getDiscountById(parseInt(req.params.id, 10));
    res.status(200).json({ 
      success: true, 
      message: "Discount fetched successfully", 
      data: discount, 
      error: null 
    });
  } catch (error) {
    next(error);
  }
};

// Update a discount
export const updateDiscount = async (req, res, next) => {
  try {
    const updatedDiscount = await discountService.updateDiscount(
      parseInt(req.params.id, 10), 
      req.body
    );
    res.status(200).json({ 
      success: true, 
      message: "Discount updated successfully", 
      data: updatedDiscount, 
      error: null 
    });
  } catch (error) {
    next(error);
  }
};

// Delete a discount
export const deleteDiscount = async (req, res, next) => {
  try {
    const result = await discountService.deleteDiscount(parseInt(req.params.id, 10));
    res.status(200).json({ 
      success: true, 
      message: "Discount deleted successfully", 
      data: result, 
      error: null 
    });
  } catch (error) {
    next(error);
  }
};
