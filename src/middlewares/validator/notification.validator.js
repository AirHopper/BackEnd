import { z } from "zod";
import customError from "../../utils/AppError.js";

const createPromotionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(8, "Description is required"),
});

const getUserNotificationSchema = z.object({
  type: z.enum(["promosi", "notifikasi"]).optional(),
  q: z.string().optional()
})

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const errorMessage = error.errors?.[0]?.message || "Invalid input data";
    next(new customError(errorMessage, 400));
  }
};

const validateParams = (schema) => (req, res, next) => {
  try {
    schema.parse(req.query);
    next();
  } catch (error) {
    const errorMessage = error.errors?.[0]?.message || "Invalid input data";
    next(new customError(errorMessage, 400));
  }
};

export const validateCreatePromotion = validate(createPromotionSchema);
export const validategetUserNotification = validateParams(getUserNotificationSchema);
