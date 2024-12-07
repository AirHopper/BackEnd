import { z } from "zod";

// Define validation schemas
const createAirplaneSchema = z.object({
  airlineId: z.string().min(1, "Airline ID is required"),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["Domestik", "Internasional"], "Invalid airplane type"),
  pricePerKm: z.number().positive("Price per km must be a positive number"),
});

const updateAirplaneSchema = z.object({
  airlineId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  type: z.enum(["Domestik", "Internasional"]).optional(),
  pricePerKm: z.number().positive().optional(),
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

export const validateCreateAirplane = validate(createAirplaneSchema);
export const validateUpdateAirplane = validate(updateAirplaneSchema);
