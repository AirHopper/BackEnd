import express from "express";
import * as notificationController from "../controllers/notification.controller.js";
import authHandler from '../middlewares/authHandler.js';
import * as validator from '../middlewares/validator/notification.validator.js';

const router = express.Router();

router.post('/promotion', validator.validateCreatePromotion, authHandler, notificationController.createPromotionNotif);
router.get('/', authHandler, notificationController.getUserNotification);

export default router;