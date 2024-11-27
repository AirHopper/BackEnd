import { resendOTP, registerUser, verifyOTPUser, loginUser, googleLoginUser, forgotPasswordUser, resetPasswordUser, getUser } from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const data = await registerUser(req.body);
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

export const resendOtp = async (req, res, next) => {
  try {
    const data = await resendOTP(req.body.email);
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
  const data = await verifyOTPUser(req.body);
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
    const data = await loginUser(req.body);
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
    const data = await googleLoginUser(req.body);
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
    const data = await forgotPasswordUser(req.body);
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
    const data = await resetPasswordUser(req.body);
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

export const getUserInfoController = async (req, res, next) => {
  try {
    const data = await getUser(req.user.id);
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