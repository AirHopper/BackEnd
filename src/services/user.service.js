import prisma from "../utils/prisma.js";
import customError from "../utils/AppError.js"
import cleanUpAccountData from "../utils/cleanUpAccountData.js"
import { comparePassword, hashPassword } from "../utils/bcrypt.js";

// GET list of all users (Admin) 
export const getAllUsers = async () => {
  try {
    const accounts = await prisma.account.findMany({ include: { user: true } });
    accounts.forEach(account => cleanUpAccountData(account));
    return accounts;
  } catch(error) {
    throw error;
  }
}

// GET user profile by id
export const getUserProfile = async (userId) => {
  try {
    const account = await prisma.account.findUnique({ 
      where: { id: userId }, 
      include: { user: true} }
    );
    cleanUpAccountData(account)
    return account;
  } catch (error) {
    throw error;
  }
}

// Update user profile by id
export const updateUserProfile = async (userId, userData) => {
  try {
    // Seperated data
    const { fullName, phoneNumber } = userData;

    // Update user's phone number and fullname
    await prisma.user.update({
      where: { accountId: userId },
      data: { 
        phoneNumber: phoneNumber,
        fullName: fullName,
      },
    })

    // Updated account
    const updatedAccount = await prisma.account.findUnique({ 
      where: { id: userId },
      include: { user: true }
    });
    cleanUpAccountData(updatedAccount);
    return updatedAccount;
  } catch(error) {
    if (error.code === "P2002") {
      throw new customError("Phone number or fullname already used", 409);
    }
    throw error;
  }
}

// Update user settings (reset password with password)
export const resetPassword = async (userId, userData) => {
  try {
    const { oldPassword, newPassword } = userData;
    const account = await prisma.account.findUnique({ 
      where: { id: userId }, 
      include: { user: true }
    });
    
    // Check if password is match or not
    if (!(await comparePassword(oldPassword, account.password))) {
      throw new customError("Invalid password", 400);
    }

    // Update user password
    await prisma.account.update({
      where: { id: userId },
      data: { password: await hashPassword(newPassword) }
    })

    cleanUpAccountData(account);
    return account;
  } catch(error) {
    throw error;
  }
}

// User notification