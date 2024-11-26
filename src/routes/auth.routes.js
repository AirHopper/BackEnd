import express from "express";
import { register, login, resendOtp, verifyOTP, googleLogin, forgotPassword, resetPassword, getUserInfoController } from "../controllers/auth.controller.js";
import authHandler from '../middlewares/authHandler.js';
import * as validator from "../middlewares/validator/auth.validator.js";

const router = express.Router();

router.post('/register', validator.validateRegister, register);
router.post('/login', validator.validateLogin, login);
router.post('/otp/resend', validator.validateResendOTP, resendOtp);
router.post('/otp/verify', validator.validateVerifyOTP, verifyOTP);
router.post('/google', googleLogin);
router.post('/password/forgot', validator.validateForgotPassword, forgotPassword);
router.post('/password/reset', validator.validateResetPassword, resetPassword);
router.get('/user', authHandler, getUserInfoController); // Example of using middleware authentication

export default router;