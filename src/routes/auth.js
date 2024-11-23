import express from "express";
import AuthController from "../controllers/auth.js";

const router = express.Router();
const auth = new AuthController();

router.post('/register', auth.register);
router.post('/login', auth.login);

export default router;