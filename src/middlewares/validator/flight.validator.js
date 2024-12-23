import { z } from "zod";

// Schema for create flight
const createFlightSchema = z.object({
  routeId: z.number().int().positive(),
  class: z
    .array(z.enum(["Economy", "Premium_Economy", "Business", "First_Class"]))
    .nonempty("Class array must contain at least one class"), // Ensures the array is not empty
  isActive: z.boolean(),
  airplaneId: z.number().int().positive(),
  departureTime: z.string().datetime(),
  arrivalTime: z.string().datetime(),
  baggage: z.number().int().nonnegative(),
  cabinBaggage: z.number().int().nonnegative(),
  entertainment: z.boolean(),
  departureTerminalId: z.number().int().positive(),
  arrivalTerminalId: z.number().int().positive(),
  discountId: z.number().int().nullable().optional(),
});

// Middleware validator
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

export const validateCreateFlight = validate(createFlightSchema);
