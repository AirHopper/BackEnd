import { z } from "zod";

// Schema untuk create flight
const createFlightSchema = z.object({
  routeId: z.number().int().positive(),
  class: z.enum(["Economy", "Premium_Economy", "Business", "First_Class"]),
  isActive: z.boolean(),
  airplaneId: z.number().int().positive(),
  departureTime: z.string().datetime(),
  arrivalTime: z.string().datetime(),
  baggage: z.number().int().nonnegative(),
  cabinBaggage: z.number().int().nonnegative(),
  entertainment: z.boolean(),
  departureTerminalId: z.number().int().positive(),
  arrivalTerminalId: z.number().int().positive(),
  discountId: z.string().min(3).max(10).nullable(),
});

// Schema untuk update flight
const updateFlightSchema = z.object({
  routeId: z.number().int().positive().optional(),
  class: z.enum(["Economy", "Premium_Economy", "Business", "First_Class"]).optional(),
  isActive: z.boolean().optional(),
  airplaneId: z.number().int().positive().optional(),
  departureTime: z.string().datetime().optional(),
  arrivalTime: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  baggage: z.number().int().nonnegative().optional(),
  cabinBaggage: z.number().int().nonnegative().optional(),
  entertainment: z.boolean().optional(),
  departureTerminalId: z.number().int().positive().optional(),
  arrivalTerminalId: z.number().int().positive().optional(),
  discountId: z.string().min(3).max(10).nullable().optional(),
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
export const validateUpdateFlight = validate(updateFlightSchema);
