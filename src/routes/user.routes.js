import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authHandler } from "../middlewares/authHandler.js";
import * as validator from "../middlewares/validator/user.validator.js";

const router = express.Router();

router.get("/", authHandler, userController.getAllUsers);
router.get("/profile", authHandler, userController.getUserProfile);
router.put(
  "/profile",
  validator.validateUpdateUserProfile,
  authHandler,
  userController.updateUserProfile
);
router.put(
  "/change-password",
  validator.validateChangePassword,
  authHandler,
  userController.changePassword
);
router.post("/notification", authHandler, userController.subscribeUser);

export default router;
