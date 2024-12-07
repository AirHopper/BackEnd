import { z } from "zod";

// Define validation schemas
const createRouteSchema = z.object({
  departureAirportId: z
    .string()
    .min(3, { message: "Departure Airport ID must be exactly 3 characters long" })
    .max(3, { message: "Departure Airport ID must be exactly 3 characters long" }),
  arrivalAirportId: z
    .string()
    .min(3, { message: "Arrival Airport ID must be exactly 3 characters long" })
    .max(3, { message: "Arrival Airport ID must be exactly 3 characters long" }),
});

const updateRouteSchema = z.object({
  departureAirportId: z
    .string()
    .min(3, { message: "Departure Airport ID must be exactly 3 characters long" })
    .max(3, { message: "Departure Airport ID must be exactly 3 characters long" })
    .optional(),
  arrivalAirportId: z
    .string()
    .min(3, { message: "Arrival Airport ID must be exactly 3 characters long" })
    .max(3, { message: "Arrival Airport ID must be exactly 3 characters long" })
    .optional(),
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

export const validateCreateRoute = validate(createRouteSchema);
export const validateUpdateRoute = validate(updateRouteSchema);
