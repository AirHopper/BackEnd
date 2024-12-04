import express from "express";
import * as ticketController from "../controllers/ticket.controller.js";
import {
  validateCreateTicket,
  validateUpdateTicket,
} from "../middlewares/validator/ticket.validator.js";
const router = express.Router();

// Get all tickets
router.get("/", ticketController.getAll);

// Get ticket by ID
router.get("/:id", ticketController.getById);

// Create a ticket
router.post("/", validateCreateTicket, ticketController.store);

// Update a ticket
router.patch("/:id", validateUpdateTicket, ticketController.update);

// Delete a ticket
router.delete("/:id", ticketController.destroy);

export default router;
