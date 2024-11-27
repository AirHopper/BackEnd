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
    const errorMessage = error.errors?.[0]?.message || "Invalid input data";
    return res.status(400).json({ error: errorMessage });
  }
};

export const validateCreateRoute = validate(createRouteSchema);
export const validateUpdateRoute = validate(updateRouteSchema);
