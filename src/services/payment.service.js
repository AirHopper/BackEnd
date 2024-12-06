import prisma from '../utils/prisma.js';
import { coreApi, MIDTRANS_CLIENT_KEY } from '../utils/midtrans.js';
import AppError from '../utils/AppError.js';
import { nanoid } from 'nanoid';

export const createPaymentByBankTransfer = async (request) => { 
    try {
        const orderId = 'airHopper-' + nanoid(10);
        const parameter = {
            payment_type: 'bank_transfer',
            transaction_details: {
                gross_amount: request.finalPrice,
                order_id: orderId,
            },
            bank_transfer:{
                bank: request.bank
            }
        };

        const chargeResponse = await coreApi.charge(parameter);
        if (chargeResponse.status_code !== '201') throw new AppError('Error on chargeResponse', 500);

        return prisma.payment.create({
            data: {
                method: chargeResponse.payment_type,
                status: chargeResponse.transaction_status,
                amount: chargeResponse.gross_amount,
                transactionId: chargeResponse.transaction_id,
                orderId: chargeResponse.order_id,
                fraudStatus: chargeResponse.fraud_status,
                bankName: chargeResponse.va_numbers[0].bank,
                bankVa: chargeResponse.va_numbers[0].va_number,
                validUntil: new Date(chargeResponse.expiry_time)
            }
        });
    } catch (error) {
        console.error('Error creating payment by bank transfer:', error);
        throw error;
    }
}

export const createPaymentByCreditCard = async (request) => {
    try {
        const orderId = 'airHopper-' + nanoid(10);
        const cardData = {
            ...request.card,
            client_key: MIDTRANS_CLIENT_KEY
        };

        const tokenResponse = await coreApi.cardToken(cardData);
        if (tokenResponse.status_code !== '200') throw new AppError('Error generating card token', 500);
        const token_id = tokenResponse.token_id;
        const parameter = {
            payment_type: 'credit_card',
            transaction_details: {
                gross_amount: request.finalPrice,
                order_id: orderId,
            },
            credit_card: {
                token_id,
                secure: true
            }
        };

        const chargeResponse = await coreApi.charge(parameter);
        if (chargeResponse.status_code !== '200') throw new AppError('Error on chargeResponse', 500);
        
        return prisma.payment.create({
            data: {
                method: chargeResponse.payment_type,
                status: chargeResponse.transaction_status,
                amount: chargeResponse.gross_amount,
                transactionId: chargeResponse.transaction_id,
                orderId: chargeResponse.order_id,
                fraudStatus: chargeResponse.fraud_status,
                validUntil: new Date(chargeResponse.expiry_time)
            }
        });
    } catch (error) {
        console.error('Error creating payment by credit card:', error);
        throw error;
    }
}

export const createPaymentByGopay = async (request, price) => {
    try {
        const orderId = 'airHopper-' + nanoid(10);
        const totalPrice = price * request.passengers.length;
        const parameter = {
            payment_type: 'gopay',
            transaction_details: {
                gross_amount: totalPrice,
                order_id: orderId,
            },
            gopay: {
                enable_callback: true
            }
        };

        const chargeResponse = await coreApi.charge(parameter);
        if (chargeResponse.status_code !== '201') throw new AppError('Error on chargeResponse', 500);

        return prisma.payment.create({
            data: {
                method: chargeResponse.payment_type,
                status: chargeResponse.transaction_status,
                amount: chargeResponse.gross_amount,
                transactionId: chargeResponse.transaction_id,
                orderId: chargeResponse.order_id,
                fraudStatus: chargeResponse.fraud_status,
                qrCodeUrl: chargeResponse.actions[0].url
            }
        });
    } catch (error) {
        console.error('Error creating payment by gopay:', error);
        throw error;
    }
}

export const getPaymentByTransactionId = async (transactionId) => {
    try {
        return prisma.payment.findUnique({
            where: {
                transactionId
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
                status: request.transaction_status,
                fraudStatus: request.fraud_status,
                payload: JSON.stringify(request),
                paymentDate
            }
        });
    } catch (error) {
        console.error('Error updating payment by id:', error);
        throw error;
    }
}