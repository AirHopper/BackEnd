import express from "express";
import * as terminalController from "../controllers/terminal.controller.js";
import { validateCreateTerminal, validateUpdateTerminal } from "../middlewares/validator/terminal.validator.js";

const router = express.Router();

// Create a terminal
router.post("/",validateCreateTerminal, terminalController.createTerminal);

// Get all terminals
router.get("/", terminalController.getAllTerminals);

// Get a terminal by ID
router.get("/:id", terminalController.getTerminalById);

// Update a terminal
router.put("/:id",validateUpdateTerminal, terminalController.updateTerminal);

// Delete a terminal
router.delete("/:id", terminalController.deleteTerminal);

export default router;
