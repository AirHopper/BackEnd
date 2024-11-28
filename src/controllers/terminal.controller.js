import * as terminalService from "../services/terminal.service.js";

// Create a new terminal
export const createTerminal = async (req, res, next) => {
  try {
    const terminal = await terminalService.createTerminal(req.body);
    res.status(201).json({ message: "Terminal created successfully", data: terminal });
  } catch (error) {
    next(error);
  }
};

// Get all terminals
export const getAllTerminals = async (req, res, next) => {
  try {
    const terminals = await terminalService.getAllTerminals();
    res.status(200).json({ data: terminals });
  } catch (error) {
    next(error);
  }
};

// Get a terminal by ID
export const getTerminalById = async (req, res, next) => {
  try {
    const terminal = await terminalService.getTerminalById(req.params.id);
    res.status(200).json({ data: terminal });
  } catch (error) {
    next(error);
  }
};

// Update a terminal
export const updateTerminal = async (req, res, next) => {
  try {
    const updatedTerminal = await terminalService.updateTerminal(req.params.id, req.body);
    res.status(200).json({ message: "Terminal updated successfully", data: updatedTerminal });
  } catch (error) {
    next(error);
  }
};

// Delete a terminal
export const deleteTerminal = async (req, res, next) => {
  try {
    const result = await terminalService.deleteTerminal(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};