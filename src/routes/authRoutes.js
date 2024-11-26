import express from "express";
import { register, login, resendOtp, verifyOTP, googlePage, googleLogin, forgotPassword, resetPassword } from "../controllers/authControllers.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/otp/resend', resendOtp);
router.post('/otp/verify', verifyOTP);
router.get('/google', googlePage);
router.get('/google/callback', googleLogin);
router.post('/password/forgot', forgotPassword);
router.post('/password/reset', resetPassword);

export default router;