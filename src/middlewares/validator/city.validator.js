import { z } from "zod";

// Define validation schemas
const createCitySchema = z.object({
  code: z
    .string()
    .min(2, "City code must be between 2 and 10 characters long")
    .max(10, "City code must be between 2 and 10 characters long"),
  name: z.string().min(1, "City name is required"),
  country: z.string().min(1, "Country is required"),
  countryCode: z
    .string()
    .min(2, "Country code must be 2-3 characters long")
    .max(3, "Country code must be 2-3 characters long"),
  continent: z.enum(
    [
      "Afrika",
      "Asia",
      "Eropa",
      "Amerika",
      "Australia",
    ],
    "Invalid continent"
  ),
});

const updateCitySchema = z.object({
  code: z.string().min(2).max(10).optional(),
  name: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  countryCode: z.string().min(2).max(3).optional(),
  continent: z
    .enum([
      "Afrika",
      "Asia",
      "Eropa",
      "Amerika",
      "Australia",
    ])
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

export const validateCreateCity = validate(createCitySchema);
export const validateUpdateCity = validate(updateCitySchema);
