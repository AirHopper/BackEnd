import prisma from "../utils/prisma.js";
import customError from "../utils/AppError.js"
// GET list of all users (Admin) 
export const getAllUsers = async () => {
  try {
    const accounts = await prisma.account.findMany();
    return accounts
  } catch(error) {
    throw error;
  }
}

// GET user profile by id

// Update user profile by id

// Update user settings

// Reset password

// Update password

// User notification