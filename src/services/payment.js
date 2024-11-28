import prisma from '../utils/prisma.js';
import { MIDTRANS_SERVER_KEY, FRONT_END_URL, MIDTRANS_API_URL, MIDTRANS_APP_URL, MIDTRANS_CLIENT_KEY } from '../utils/midtrans.js';
import AppError from '../utils/AppError.js';
import MidtransClient from 'midtrans-client';

let coreApi = new MidtransClient.CoreApi({
    isProduction : false,
    serverKey : MIDTRANS_SERVER_KEY,
    clientKey : MIDTRANS_CLIENT_KEY
});

// export const getTicketsByUserId = async (userId) => {
//     try {
//         return prisma.ticket.findMany({
//             where: {
//                 userId
//             },
//             include: {
//                 Flight: true,
//                 Payment: true
//             }
//         });
//     } catch (error) {
//         console.error('Error fetching tickets:', error);
//         throw error;
//     }
// }

export const createPayment = async (req) => { 
    try {
        const orderId = 'orderId-' + Math.random().toString(36).substr(2, 9);
        console.log(req.method)

        let parameter = {
            payment_type: req.method,
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