import { z } from "zod";

// Schema for creating a ticket with simplified payload
const createTicketSchema = z.object({
  routeId: z.number().int().positive(),
  flightIds: z.array(z.number().int().positive()),
  discountId: z.number().int().nullable().optional(),
});

// Schema for updating a ticket (optional fields)
const updateTicketSchema = z.object({
  routeId: z.number().int().positive().optional(),
  flightIds: z.array(z.number().int().positive()).optional(),
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

export const validateCreateTicket = validate(createTicketSchema);
export const validateUpdateTicket = validate(updateTicketSchema);
