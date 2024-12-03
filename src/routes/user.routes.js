import express from "express";
import * as userController from "../controllers/user.controller.js";
import authHandler from '../middlewares/authHandler.js';

const router = express.Router();

router.get('/', authHandler, userController.getAllUsers);

export default router;