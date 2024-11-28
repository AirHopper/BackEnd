import prisma from '../utils/prisma.js';
import { MIDTRANS_SERVER_KEY, FRONT_END_URL, MIDTRANS_API_URL, MIDTRANS_APP_URL, MIDTRANS_CLIENT_KEY } from '../utils/midtrans.js';
import AppError from '../utils/AppError.js';
import MidtransClient from 'midtrans-client';
import crypto from 'crypto';

let coreApi = new MidtransClient.CoreApi({
    isProduction : false,
    serverKey : MIDTRANS_SERVER_KEY,
    clientKey : MIDTRANS_CLIENT_KEY
});

export const createPayment = async (request) => { 
    try {
        const orderId = 'orderId-' + Math.random().toString(36).substr(2, 9);
        console.log(request.method)

        let parameter = {
            payment_type: request.method,
            transaction_details: {
                gross_amount: 24145,
                order_id: orderId,
            },
            // bank_transfer:{
            //     bank: "bni"
            // }
        };

        const chargeResponse = await coreApi.charge(parameter);
        if (chargeResponse.status_code !== '201') {
            throw new AppError('Error on chargeResponse', 500);
        }
        // console.log('chargeResponse:', JSON.stringify(chargeResponse));
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
        return prisma.payment.update({
            where: {
                id
            },
            data: {
                status: request.transaction_status,
                fraudStatus: request.fraud_status,
                payload: JSON.stringify(request)
            }
        });
    } catch (error) {
        console.error('Error updating payment by id:', error);
        throw error;
    }
}

export const isValidSignatureMidtrans = (request) => {
    const hash = crypto.createHash('sha512')
        .update(`${request.transactionId}${request.status_code}${request.gross_amount}${MIDTRANS_SERVER_KEY}`)
        .digest('hex');

    return hash === request.signature_key;
}