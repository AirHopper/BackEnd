import * as authService from "../services/auth.service.js";
import customError from "../utils/AppError.js"

export const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: data,
      error: null,
    })
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export const resendOTP = async (req, res, next) => {
  try {
    const data = await authService.resendOTP(req.body.email);
    res.status(200).json({
      success: true,
      message: "OTP is resent",
      data: data,
      error: null,
    })
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export const verifyOTP = async (req, res, next) => {
  try {
    const data = await authService.verifyOTP(req.body);
    res.status(200).json({
      success: true,
      message: "Email is verified",
      data: data,
      error: null,
    })
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    // Send response or redirect to Homepage (after user login)
    res.status(200).json({
      success: true,
      message: "User login successfully",
      data: data,
      error: null,
    })
    // res.redirect(`/?token=${data.token}}`);
  } catch (error) {
    console.log(error);
    next(error)
  }
}

export const googleLogin = async (req, res, next) => {
  try {
    const data = await authService.googleLogin(req.body);
    res.status(200).json({
      success: true,
      message: "User login with google successfully",
      data: data,
      error: null,
    })
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export const forgotPassword = async (req, res, next) => {
  try {
    const data = await authService.forgotPassword(req.body);
    res.status(200).json({
      success: true,
      message: "Reset password link sent to user email",
      data: data,
      error: null,
    })
  } catch (error) {
    console.log(error);
    next(error)
  }
}

export const resetPassword = async (req, res, next) => {
  try {
    const data = await authService.resetPassword(req.body);
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      data: data,
      error: null,
    })
  } catch (error) {
    console.log(error);
    next(error)
  }
}

export const getUser = async (req, res, next) => {
  try {
    const data = await authService.getUser(req.user.id);
    res.status(200).json({
      success: true,
      message: "Get user successfully",
      data: data,
      error: null,
    })
  } catch (error) {
    console.log(error);
    next(error)
  }
}

export const registerAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin') {
      throw new customError('You do not have permission to perform this action', 403);
    }

    const data = await authService.registerAdmin(req.body);
    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: data,
      error: null,
    })
  } catch (error) {
    console.log(error);
    next(error);
  }
}