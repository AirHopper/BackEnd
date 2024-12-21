import * as userService from "../services/user.service.js";
import customError from "../utils/AppError.js"

export const getAllUsers = async (req, res, next) => {
  try {
    // Only admins are allowed to view all users.
    if (req.user.role !== 'Admin') {
      throw new customError('You do not have permission to perform this action', 403);
    }

    const data = await userService.getAllUsers();
    res.status(200).json({
      success: true,
      message: "Get all users successfully",
      data: data,
      error: null,
    })
  } catch(error) {
    console.log(error);
    next(error);
  }
}

export const getUserProfile = async (req, res, next) => {
  try {
    const data = await userService.getUserProfile(req.user.id);
    res.status(200).json({
      success: true,
      message: "Get user profile successfully",
      data: data,
      error: null,
    })
  } catch(error) {
    console.log(error);
    next(error);
  }
}
 
export const deleteUserById = async (req, res, next) => {
  try {
    // Only admins are allowed to delete user by id
    if (req.user.role !== 'Admin') {
      throw new customError('You do not have permission to perform this action', 403);
    }

    const data = await userService.deleteUserById(req.params);
    res.status(200).json({
      success: true,
      message: "Delete user by id successfully",
      data: data,
      error: null,
    })
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export const updateUserProfile = async (req, res, next) => {
  try {
    const data = await userService.updateUserProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Update user profile successfully",
      data: data,
      error: null,
    })
  } catch(error) {
    console.log(error);
    next(error);
  }
}

export const changePassword = async (req, res, next) => {
  try {
    const data = await userService.changePassword(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Update user password successfully",
      data: data,
      error: null,
    })
  } catch(error) {
    console.log(error);
    next(error);
  }
}

export const subscribeUser = async (req, res, next) => {
  try {
    await userService.subscribeUser(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Subscription saved!",
      data: null,
      error: null,
    })
  } catch(error) {
    console.log(error);
    next(error);
  }
}