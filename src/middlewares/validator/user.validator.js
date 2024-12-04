import { z } from "zod";
import customError from "../../utils/AppError.js"

const changePasswordSchema = z.object({
  oldPassword: 
    z.string()
    .min(8, "Password must be at least 8 characters"),
  newPassword: 
    z.string()
    .min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Password didn't match",
  path: ["confirmPassword"],
});

const updateUserProfileSchema = z.object({
  fullName: z.string().min(1, "Fullname cannot be empty"),
  phoneNumber:
    z.string()
      .regex(/^\d+$/, "Phone number must contain only digits")
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must not exceed 15 digits"),
})

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const errorMessage = error.errors?.[0]?.message || "Invalid input data";
    next(new customError(errorMessage, 400))
  }
};

export const validateChangePassword = validate(changePasswordSchema);
export const validateUpdateUserProfile = validate(updateUserProfileSchema);