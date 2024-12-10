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
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: fieldErrors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const validateCreateTerminal = validate(createTerminalSchema);
export const validateUpdateTerminal = validate(updateTerminalSchema);
