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
    ["Afrika", "Asia", "Europa", "Amerika", "Australia"],
    "Invalid continent"
  ),
});

const updateCitySchema = z.object({
  code: z.string().min(2).max(10).optional(),
  name: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  countryCode: z.string().min(2).max(3).optional(),
  continent: z
    .enum(["Afrika", "Asia", "Eropa", "Amerika", "Australia"])
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

export const validateCreateCity = validate(createCitySchema);
export const validateUpdateCity = validate(updateCitySchema);
