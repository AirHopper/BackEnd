import prisma from '../utils/prisma.js';
import { coreApi, snap } from '../utils/midtrans.js';
import { nanoid } from 'nanoid';
import AppError from '../utils/AppError.js';

export const createPayment = async (request, account) => {
    try {
        const orderId = nanoid(8);
        const nameParts = account.user.fullName.split(' ');
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        const firstName = nameParts[0];
        const parameter = {
            transaction_details: {
                gross_amount: request.finalPrice,
                order_id: orderId
            },
            customer_details: {
                first_name: firstName,
                last_name: lastName,
                email: account.email,
                phone: account.user.phoneNumber
            }
        }

        const midtransToken = await snap.createTransactionToken(parameter);
        
        return prisma.payment.create({
            data: {
                orderId: orderId,
                amount: request.finalPrice,
                token: midtransToken
            }
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        throw error;
    }
}

export const getPaymentByOrderId = async (orderId) => {
    try {
        return prisma.payment.findUnique({
            where: {
                orderId
            }
        });
    } catch (error) {
        console.error('Error get payment by transaction id:', error);
        throw error;
    }
}

export const updatePaymentStatusById = async (id, request) => {
    try {
        let paymentDate = null;
        if (request.transaction_status === 'settlement' || request.transaction_status === 'capture') paymentDate = new Date();

        return prisma.payment.update({
            where: {
                id
            },
            data: {
                method: request.payment_type,
                status: request.transaction_status,
                payload: JSON.stringify(request),
                transactionId: request.transaction_id,
                fraudStatus: request.fraud_status,
                validUntil: new Date(request.expiry_time),
                paymentDate
            }
        });
    } catch (error) {
        console.error('Error updating payment by id:', error);
        throw error;
    }
}

export const cancelPaymentByOrderId = async (orderId) => {
    try {
        const chargeResponse = await coreApi.transaction.cancel(orderId);
        if (chargeResponse.status_code !== '200') throw new AppError('Error on chargeResponse', 500);
        return;
    } catch (error) {
        console.error('Error cancelling payment by order id:', error);
        throw error;
    }
}