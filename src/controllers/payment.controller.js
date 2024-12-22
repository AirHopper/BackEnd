import { getPaymentByOrderId, updatePaymentStatusById } from "../services/payment.service.js";
import { updateOrderStatusByPaymentId, addQrCodeAndPdfUrlOrder } from "../services/order.service.js";
import { isValidSignatureMidtrans } from "../utils/midtrans.js";
import { updateSeatOccupied } from "../services/seat.service.js";
import { getPassegersByOrderId } from "../services/passenger.service.js";
import { getUser } from "../services/auth.service.js";
import { sendReceiptPayment } from "../utils/nodemailer.js";
import { createOrderNotification } from "../services/notification.service.js";
import AppError from '../utils/AppError.js';
import { getUserOwnedOrderById } from "../services/order.service.js";

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
        
        // Check Payment Status
        if (updatedOrder.orderStatus === 'Expired') {
            await updateSeatOccupied(seatIds, false);
            await createOrderNotification(account.id, 'Pemesanan kadaluwarsa', `Pemesanan dengan id ${updatedOrder.id} telah kadaluwarsa`);
        }
        // Cancelled already handle in order service
        if (updatedOrder.orderStatus === 'Issued') {
            const order = await getUserOwnedOrderById(updatedOrder.id, account.user.id);
            const pdfUrl = await addQrCodeAndPdfUrlOrder(order);
            sendReceiptPayment(account.email, updatedOrder.id, pdfUrl);
            await createOrderNotification(account.id, 'Pembayaran berhasil', `Pemesanan dengan id ${updatedOrder.id} berhasil dibayar`);
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