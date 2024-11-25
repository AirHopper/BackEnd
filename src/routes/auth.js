import express from "express";
import { register, login, resendOtp, verifyOTP, googlePage, googleLogin } from "../controllers/auth.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/otp/resend', resendOtp);
router.post('/otp/verify', verifyOTP);
router.get('/google', googlePage);
router.get('/google/callback', googleLogin);

export default router;