import { z } from "zod";

// Schema for create order
const createOrderSchema = z.object({
  outboundTicketId: z.number().int().positive(),
	returnTicketId: z.number().int().nullable().optional(),
	finalPrice: z.number().int().positive(),
	detailPrice: z.array(
		z.object({}).passthrough()
	),
	passengers: z.array(z.object({
		seatId: z.array(
			z.number().int().positive()
		), 
		type: z.string(),
		title: z.string(),
		name: z.string(),
		familyName: z.string().nullable().optional(),
		dateOfBirth: z.string().datetime(),
		nationality: z.string(),
		identifierNumber: z.string(),
		issuedCountry: z.string(),
		idValidUntil: z.string().datetime()
	}))
})

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

export const validateCreateOrder = validate(createOrderSchema);