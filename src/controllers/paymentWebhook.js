import { getPaymentByTransactionId, updatePaymentStatusById, isValidSignatureMidtrans } from "../services/payment.service.js";
import AppError from "../utils/AppError.js";

export const notification = async (req, res, next) => {
    try {
        console.log(req.body);
        const checkSignature = isValidSignatureMidtrans(req.body);
        if (!checkSignature) throw new AppError('Invalid Signature', 400);
        const payment = await getPaymentByTransactionId(req.body.transaction_id);
        if (!payment) throw new AppError('Payment not found', 404);
        const updatedPayment = await updatePaymentStatusById(payment.id, req.body);

        res.status(200).json({
            success: true,
            message: 'Payment Webhook processed successfully',
            data: updatedPayment
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}