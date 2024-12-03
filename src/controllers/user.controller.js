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