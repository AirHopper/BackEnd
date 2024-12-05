import { z } from "zod";

// Define validation schemas
const createTerminalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["Domestik", "Internasional"], "Invalid terminal type"),
  airportId: z.string().min(1, "Airport ID is required"),
});

const updateTerminalSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["Domestik", "Internasional"]).optional(),
  airportId: z.string().min(1).optional(),
});

// Middleware for validation
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const errorMessage = error.errors?.[0]?.message || "Invalid input data";
    return res.status(400).json({ error: errorMessage });
  }
};

export const validateCreateTerminal = validate(createTerminalSchema);
export const validateUpdateTerminal = validate(updateTerminalSchema);
