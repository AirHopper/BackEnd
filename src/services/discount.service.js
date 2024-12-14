import prisma from "../utils/prisma.js";
import AppError from "../utils/AppError.js";

// Create a new discount
export const createDiscount = async (data) => {
  try {
    const { percentage } = data;

    if (percentage < 0 || percentage > 100) {
      throw new AppError("Percentage must be between 0 and 100", 400);
    }

    const newDiscount = await prisma.discount.create({
      data: {
        percentage,
      },
    });

    return newDiscount;
  } catch (error) {
    console.error("Error creating discount:", error);
    throw error;
  }
};

// Get all discounts
export const getAllDiscounts = async () => {
  try {
    const discounts = await prisma.discount.findMany();
    return discounts;
  } catch (error) {
    console.error("Error fetching discounts:", error);
    throw error;
  }
};

// Get a discount by ID
export const getDiscountById = async (id) => {
  try {
    const discount = await prisma.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new AppError("Discount not found", 404);
    }

    return discount;
  } catch (error) {
    console.error("Error fetching discount:", error);
    throw error;
  }
};

// Update a discount
export const updateDiscount = async (id, data) => {
  try {
    const discount = await prisma.discount.findUnique({ where: { id } });

    if (!discount) {
      throw new AppError("Discount not found", 404);
    }

    const { percentage } = data;

    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      throw new AppError("Percentage must be between 0 and 100", 400);
    }

    const updatedDiscount = await prisma.discount.update({
      where: { id },
      data,
    });

    return updatedDiscount;
  } catch (error) {
    console.error("Error updating discount:", error);
    throw error;
  }
};

// Delete a discount
export const deleteDiscount = async (id) => {
  try {
    const discount = await prisma.discount.findUnique({ where: { id } });

    if (!discount) {
      throw new AppError("Discount not found", 404);
    }

    await prisma.discount.delete({ where: { id } });

    return {
      message: `Discount with ID ${id} deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting discount:", error);
    throw error;
  }
};
