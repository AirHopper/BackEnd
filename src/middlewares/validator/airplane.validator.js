import { z } from "zod";

// Define validation schemas
const createAirplaneSchema = z.object({
  airlineId: z.string().min(1, "Airline ID is required"),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["domestic", "international"], "Invalid airplane type"),
  pricePerKm: z.number().positive("Price per km must be a positive number"),
});

const updateAirplaneSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["domestic", "international"]).optional(),
  pricePerKm: z.number().positive().optional(),
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

export const validateCreateAirplane = validate(createAirplaneSchema);
export const validateUpdateAirplane = validate(updateAirplaneSchema);
