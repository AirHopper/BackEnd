import { z } from "zod";
import customError from "../../utils/AppError.js";

// Define validation schemas
const registerSchema = z.object({
  email: z.string().email("Please input a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Fullname cannot be empty"),
  phoneNumber: z.string().regex(/^\d+$/, "Phone number must contain only digits").min(10, "Phone number must be at least 10 digits").max(15, "Phone number must not exceed 15 digits"),
});

const resendOTPSchema = z.object({
  email: z.string().email("Please input a valid email"),
});

const verifyOTPSchema = z.object({
  email: z.string().email("Please input a valid email"),
  otpCode: z.string().length(6, "OTP code must be exactly 6 digits").regex(/^\d+$/, "OTP code must contain only digits"),
});

const identifierSchema = z.string().refine((value) => z.string().email().safeParse(value).success || /^\d{10,15}$/.test(value), {
  message: "Identifier must be a valid email or phone number",
});
const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const googleLoginSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please input a valid email"),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password didn't match",
    path: ["confirmPassword"],
  });

// Middleware for validation
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const errorMessage = error.errors?.[0]?.message || "Invalid input data";
    next(new customError(errorMessage, 400));
  }
};

// Export middleware functions
export const validateRegister = validate(registerSchema);
export const validateResendOTP = validate(resendOTPSchema);
export const validateVerifyOTP = validate(verifyOTPSchema);
export const validateLogin = validate(loginSchema);
export const validateGoogleLogin = validate(googleLoginSchema);
export const validateForgotPassword = validate(forgotPasswordSchema);
export const validateResetPassword = validate(resetPasswordSchema);
