import express from "express";
import { register, login, resendOtp, verifyEmail, googlePage, googleLogin } from "../controllers/auth.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/resend_otp', resendOtp);
router.post('/verify', verifyEmail);
router.get('/google', googlePage);
router.get('/google/callback', googleLogin);

export default router;