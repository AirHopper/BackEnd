import express from "express";
import * as userController from "../controllers/user.controller.js";
import authHandler from '../middlewares/authHandler.js';

const router = express.Router();

router.get('/', authHandler, userController.getAllUsers);
router.get('/profile', authHandler, userController.getUserProfile);
router.patch('/profile', authHandler, userController.updateUserProfile);
router.patch('/reset-password', authHandler, userController.resetPassword);

export default router;