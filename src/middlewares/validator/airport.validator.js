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
  type: z.enum(["Domestic", "International"], "Invalid airport type"),
  cityId: z.string().min(1, "City ID is required"),
});

const updateAirportSchema = z.object({
  name: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  type: z.enum(["Domestic", "International"]).optional(),
  cityId: z.string().optional(),
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

export const validateCreateAirport = validate(createAirportSchema);
export const validateUpdateAirport = validate(updateAirportSchema);
