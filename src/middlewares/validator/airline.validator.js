import { z } from "zod";

// Define validation schemas
const createAirlineSchema = z.object({
  iataCode: z
    .string()
    .min(2, "IATA code must be 2-3 characters long")
    .max(3, "IATA code must be 2-3 characters long"),
  name: z.string().min(1, "Airline name is required"),
});

const updateAirlineSchema = z.object({
  iataCode: z
    .string()
    .min(2, "IATA code must be 2-3 characters long")
    .max(3, "IATA code must be 2-3 characters long")
    .optional(),
  name: z.string().min(1, "Airline name must be at least 1 character long").optional(),
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

export const validateCreateAirline = validate(createAirlineSchema);
export const validateUpdateAirline = validate(updateAirlineSchema);
