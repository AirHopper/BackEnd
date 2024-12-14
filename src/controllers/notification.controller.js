import * as notificationService from "../services/notification.service.js";
import customError from "../utils/AppError.js"

export const createPromotionNotif = async (req, res, next) => {
  try {
    // Only admins are allowed to create promotions
    if (req.user.role !== 'Admin') {
      throw new customError('You do not have permission to perform this action', 403);
    }

    const data = await notificationService.createPromotionNotif(req.body);
    res.status(200).json({
      success: true,
      message: "Create promotion notification to all users successfully",
      data: data,
      error: null,
    })
  } catch(error) {
    console.log(error);
    next(error);
  }
}

export const getUserNotification = async (req, res, next) => {
  try {
    const data = await notificationService.getUserNotification(req.user.id);
    res.status(200).json({
      success: true,
      message: "All notifications has been read successfully!",
      data: data,
      error: null,
    })
  } catch(error) {
    console.log(error);
    next(error);
  }
}