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
    const errorMessage = error.errors?.[0]?.message || "Invalid input data";
    return res.status(400).json({ error: errorMessage });
  }
};

export const validateCreateAirline = validate(createAirlineSchema);
export const validateUpdateAirline = validate(updateAirlineSchema);
