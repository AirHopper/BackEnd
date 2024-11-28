import { createPaymentWebhookLog } from "../services/paymentWebhookLog";

export const create = async (req, res, next) => {
    try {
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