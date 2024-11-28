import { createPaymentWebhookLog } from "../services/paymentWebhookLog.js";

export const create = async (req, res, next) => {
    try {
        console.log(req.body)
        const paymentWebhookLog = await createPaymentWebhookLog(req.body);
        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: paymentWebhookLog
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}