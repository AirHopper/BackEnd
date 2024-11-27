// import { getTicketsByUserId, createPayment } from "../services/payment.js";
import { createPayment } from "../services/payment.js";

export const create = async (req, res, next) => {
    try {
        console.log(req.body)
        const payment = await createPayment(req.body);
        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: payment
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}