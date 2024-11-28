import prisma from '../utils/prisma.js';
import { MIDTRANS_SERVER_KEY, FRONT_END_URL, MIDTRANS_API_URL, MIDTRANS_APP_URL, MIDTRANS_CLIENT_KEY } from '../utils/midtrans.js';
import AppError from '../utils/AppError.js';
import MidtransClient from 'midtrans-client';

let coreApi = new MidtransClient.CoreApi({
    isProduction : false,
    serverKey : MIDTRANS_SERVER_KEY,
    clientKey : MIDTRANS_CLIENT_KEY
});

export const createPaymentWebhookLog = async (req) => { 
    try {
        // const paymentWehbookLog = await coreApi.transaction.notification(req.body)
        // console.log(paymentWehbookLog)
        

        // const stringPaymentWehbookLog = JSON.stringify(paymentWehbookLog)

        // return prisma.payment.create({
        //     data: {
        //         method: chargeResponse.payment_type,
        //         status: chargeResponse.transaction_status,
        //         amount: chargeResponse.gross_amount,
        //         transactionId: chargeResponse.transaction_id,
        //         orderId: chargeResponse.order_id,
        //         fraudStatus: chargeResponse.fraud_status,
        //         validUntil: new Date(chargeResponse.expiry_time)
        //     }
        // });
    } catch (error) {
        console.error('Error creating payment:', error);
        throw error;
    }
}