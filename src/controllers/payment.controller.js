import { createPaymentByBankTransfer, createPaymentByCreditCard, getPaymentByTransactionId, updatePaymentStatusById } from "../services/payment.service.js";
import { updateOrderStatusByPaymentId } from "../services/order.service.js";
import { isValidSignatureMidtrans } from "../utils/midtrans.js";
import { updateSeatOccupied } from "../services/seat.service.js";
import { getPassegersByOrderId } from "../services/passenger.service.js";
import AppError from '../utils/AppError.js';
import { getAccountByUserId } from "../services/auth.service.js";
import { sendEmail } from "../utils/nodemailer.js";

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
        const updatedOrder = await updateOrderStatusByPaymentId(updatedPayment.id, updatedPayment.status);
        const account = await getAccountByUserId(updatedOrder.user.id);
        const passengers = await getPassegersByOrderId(updatedOrder.id);
        const seatIds = passengers.map(passenger => passenger.seatId);
        if (updatedOrder.orderStatus === 'Cancelled' || updatedOrder.orderStatus === 'Expired') await updateSeatOccupied(seatIds, false);
        if (updatedOrder.oderStatus === 'Issued') {
            const email = await sendEmail(account.email, 'Invoice Payment', `Invoice for order ${updatedOrder.id} in airHopper`);
            if (!email) throw new AppError('Failed to send email', 500);
        }

        res.status(200).json({
            success: true,
            message: 'Payment Webhook processed successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}