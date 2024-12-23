import express from "express";
import * as ticketController from "../controllers/ticket.controller.js";
import {
  validateCreateTicket,
} from "../middlewares/validator/ticket.validator.js";
import { adminHandler, authHandler } from "../middlewares/authHandler.js";
const router = express.Router();

// Get all tickets
router.get("/", ticketController.getAll);

// Get ticket by ID
router.get("/:id", ticketController.getById);

// Create a ticket
router.post("/", authHandler, adminHandler, validateCreateTicket, ticketController.store);

// Delete a ticket
router.delete("/:id", authHandler, adminHandler, ticketController.destroy);

export default router;
