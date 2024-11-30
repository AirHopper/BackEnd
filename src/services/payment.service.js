import prisma from '../utils/prisma.js';
import { MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY } from '../utils/midtrans.js';
import AppError from '../utils/AppError.js';
import MidtransClient from 'midtrans-client';
import crypto from 'crypto';

let coreApi = new MidtransClient.CoreApi({
    isProduction : false,
    serverKey : MIDTRANS_SERVER_KEY,
    clientKey : MIDTRANS_CLIENT_KEY
});

export const createPaymentByBankTransfer = async (request, price) => { 
    try {
        const orderId = 'airHopper-' + Math.random().toString(36).substr(2, 9);

        let parameter = {
            payment_type: 'bank_transfer',
            transaction_details: {
                gross_amount: price,
                order_id: orderId,
            },
            bank_transfer:{
                bank: request.bank
            }
        };

        const chargeResponse = await coreApi.charge(parameter);
        if (chargeResponse.status_code !== '201') {
            throw new AppError('Error on chargeResponse', 500);
        }
        console.log(chargeResponse);

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
        console.error('Error creating payment:', error);
        throw error;
    }
}

export const createPaymentByCreditCard = async (request) => {
    try {
        const orderId = 'airHopper-' + Math.random().toString(36).substr(2, 9);
        // console.log(request);

        const { card_number, card_cvv, card_exp_month, card_exp_year } = request;

        if (!card_number || !card_cvv || !card_exp_month || !card_exp_year) {
            throw new AppError('Credit card details are required', 400);
        }

        console.log('halo dek')

        // Tokenize the credit card details
        const cardData = {
            card_number,
            card_exp_month,
            card_exp_year,
            card_cvv,
            client_key: MIDTRANS_CLIENT_KEY
        };

        const tokenResponse = await coreApi.cardToken(cardData);
        if (tokenResponse.status_code !== '200') {
            throw new AppError('Error generating card token', 500);
        }

        console.log(tokenResponse);
        const token_id = tokenResponse.token_id;

        let parameter = {
            payment_type: 'credit_card',
            transaction_details: {
                gross_amount: 24145,
                order_id: orderId,
            },
            credit_card: {
                token_id,
                secure: true
            }
        };

        const chargeResponse = await coreApi.charge(parameter);
        // if (chargeResponse.status_code !== '201') {
        //     throw new AppError('Error on chargeResponse', 500);
        // }
        console.log(chargeResponse);

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
        console.error('Error creating payment:', error);
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

export const isValidSignatureMidtrans = (request) => {
    const hash = crypto.createHash('sha512')
        .update(`${request.order_id}${request.status_code}${request.gross_amount}${MIDTRANS_SERVER_KEY}`)
        .digest('hex');

    return hash === request.signature_key;
}