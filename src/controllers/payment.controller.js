import { createPaymentByBankTransfer, createPaymentByCreditCard, getPaymentByTransactionId, updatePaymentStatusById, isValidSignatureMidtrans } from "../services/payment.service.js";
import { updateTicketStatusByPaymentId } from "../services/ticket.service.js";

import AppError from '../utils/AppError.js';

export const createByBankTransfer = async (req, res, next) => {
    try {
        console.log(req.body)
        const payment = await createPaymentByBankTransfer(req.body);
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

export const createByCreditCard = async (req, res, next) => {
    try {
        console.log(req.body)
        const payment = await createPaymentByCreditCard(req.body);
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

export const notifications = async (req, res, next) => {
    try {
        console.log(req.body);
        const checkSignature = isValidSignatureMidtrans(req.body);
        if (!checkSignature) throw new AppError('Invalid Signature', 400);
        const payment = await getPaymentByTransactionId(req.body.transaction_id);
        if (!payment) throw new AppError('Payment not found', 404);
        const updatedPayment = await updatePaymentStatusById(payment.id, req.body);
        const updatedTicket = await updateTicketStatusByPaymentId(updatedPayment.id, updatedPayment.status);

        res.status(200).json({
            success: true,
            message: 'Payment Webhook processed successfully',
            data: updatedTicket
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}