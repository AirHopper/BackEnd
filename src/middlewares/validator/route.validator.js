import { z } from "zod";

// Define validation schemas
const createRouteSchema = z.object({
  departureAirportId: z.string().min(3).max(3),
  arrivalAirportId: z.string().min(3).max(3),
});

const updateRouteSchema = z.object({
  departureAirportId: z.string().min(3).max(3).optional(),
  arrivalAirportId: z.string().min(3).max(3).optional(),
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

// Export middleware functions
export const validateCreateRoute = validate(createRouteSchema);
export const validateUpdateRoute = validate(updateRouteSchema);
