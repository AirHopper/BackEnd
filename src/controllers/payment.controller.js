import { getPaymentByOrderId, updatePaymentStatusById } from "../services/payment.service.js";
import { updateOrderStatusByPaymentId } from "../services/order.service.js";
import { isValidSignatureMidtrans } from "../utils/midtrans.js";
import { updateSeatOccupied } from "../services/seat.service.js";
import { getPassegersByOrderId } from "../services/passenger.service.js";
import { getUser } from "../services/auth.service.js";
import { sendEmail } from "../utils/nodemailer.js";
import { createOrderNotification } from "../services/notification.service.js";
import AppError from '../utils/AppError.js';

export const notifications = async (req, res, next) => {
    try {
        console.log(req.body);
        const validSignature = isValidSignatureMidtrans(req.body);
        if (!validSignature) throw new AppError('Invalid Signature', 400);
        const payment = await getPaymentByOrderId(req.body.order_id);
        if (!payment) throw new AppError('Payment not found', 404);
        const updatedPayment = await updatePaymentStatusById(payment.id, req.body);
        const updatedOrder = await updateOrderStatusByPaymentId(updatedPayment.id, updatedPayment.status);
        const account = await getUser(updatedOrder.User.accountId);
        const passengers = await getPassegersByOrderId(updatedOrder.id);
        const seatIds = passengers.map(passenger => passenger.seatId);
        
        // Cek status pembayaran
        console.log(account.email);
        if (updatedOrder.orderStatus === 'Expired') {
            await updateSeatOccupied(seatIds, false);
            await createOrderNotification(account.user.id, 'Pemesanan kadaluwarsa', `Pemesanan dengan id ${order.id} kadaluwarsa`);
        }
        // Cancelled already handle in order service
        if (updatedOrder.orderStatus === 'Issued') {
            sendEmail(account.email, 'Invoice Payment', `Invoice for order ${updatedOrder.id} in airHopper`);
        }
        res.status(200).json({
            success: true,
            message: 'Payment Webhook processed successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}