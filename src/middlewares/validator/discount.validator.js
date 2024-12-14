import { z } from "zod";

// Define validation schemas
const createDiscountSchema = z.object({
  percentage: z
    .number()
    .int("Percentage must be an integer")
    .min(0, "Percentage must be at least 0")
    .max(100, "Percentage must be at most 100"),
});

const updateDiscountSchema = z.object({
  percentage: z
    .number()
    .int("Percentage must be an integer")
    .min(0, "Percentage must be at least 0")
    .max(100, "Percentage must be at most 100")
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

export const validateCreateDiscount = validate(createDiscountSchema);
export const validateUpdateDiscount = validate(updateDiscountSchema);
