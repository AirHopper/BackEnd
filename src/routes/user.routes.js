import express from "express";
import * as userController from "../controllers/user.controller.js";
import authHandler from '../middlewares/authHandler.js';

const router = express.Router();

router.get('/', authHandler, userController.getAllUsers);
router.get('/profile', authHandler, userController.getUserProfile);
router.put('/profile', authHandler, userController.updateUserProfile);
router.put('/reset-password', authHandler, userController.resetPassword);

export default router;