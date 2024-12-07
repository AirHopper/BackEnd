import { z } from "zod";

// Define validation schemas
const createAirportSchema = z.object({
  iataCode: z.string().length(3, "IATA code must be exactly 3 characters long"),
  name: z.string().min(1, "Name is required"),
  latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180)
    .max(180, "Longitude must be between -180 and 180"),
  type: z.enum(["Domestik", "Internasional"], "Invalid airport type"),
  cityId: z.string().min(1, "City ID is required"),
});

const updateAirportSchema = z.object({
  name: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  type: z.enum(["Domestik", "Internasional"]).optional(),
  cityId: z.string().optional(),
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

export const validateCreateAirport = validate(createAirportSchema);
export const validateUpdateAirport = validate(updateAirportSchema);
