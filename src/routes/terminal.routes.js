import express from "express";
import * as terminalController from "../controllers/terminal.controller.js";
import { validateCreateTerminal, validateUpdateTerminal } from "../middlewares/validator/terminal.validator.js";
import { adminHandler, authHandler } from "../middlewares/authHandler.js";

const router = express.Router();

// Create a terminal
router.post("/", authHandler, adminHandler, validateCreateTerminal, terminalController.createTerminal);

// Get all terminals
router.get("/", terminalController.getAllTerminals);

// Get a terminal by ID
router.get("/:id", terminalController.getTerminalById);

// Update a terminal
router.put("/:id", authHandler, adminHandler, validateUpdateTerminal, terminalController.updateTerminal);

// Delete a terminal
router.delete("/:id", authHandler, adminHandler, terminalController.deleteTerminal);

export default router;
