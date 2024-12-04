import express from "express";
import * as authController from "../controllers/auth.controller.js";
import authHandler from '../middlewares/authHandler.js';
import * as validator from "../middlewares/validator/auth.validator.js";

const router = express.Router();

router.post('/register', validator.validateRegister, authController.register);
router.post('/login', validator.validateLogin, authController.login);
router.post('/otp/resend', validator.validateResendOTP, authController.resendOTP);
router.post('/otp/verify', validator.validateVerifyOTP, authController.verifyOTP);
router.post('/google', validator.validateGoogleLogin, authController.googleLogin);
router.post('/password/forgot', validator.validateForgotPassword, authController.forgotPassword);
router.post('/password/reset', validator.validateResetPassword, authController.resetPassword);
router.get('/user', authHandler, authController.getUser); // Example of using middleware authentication

export default router;