import prisma from '../utils/prisma.js';
import { MIDTRANS_SERVER_KEY, FRONT_END_URL, MIDTRANS_API_URL, MIDTRANS_APP_URL } from '../utils/midtrans.js';
import AppError from '../utils/AppError.js';

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
        const transactionId = 'transaction-' + Math.random().toString(36).substr(2, 9);
        const price = 1000;
        const authString = btoa(`${MIDTRANS_SERVER_KEY}:`);

        const payload = {
            transaction_details: {
                order_id: transactionId,
                gross_amount: price
            },
            item_details: {
                name: 'test item',
                price: price,
                quantity: 1
            },
            customer_details: {
                email: 'halodek@gmail.com'
            },
            callback: {
                finish: `${FRONT_END_URL}/order-status?transaction_id=${transactionId}`,
                error: `${FRONT_END_URL}/order-status?transaction_id=${transactionId}`,
                pending: `${FRONT_END_URL}/order-status?transaction_id=${transactionId}`
            }
        }

        const response = await fetch(`${MIDTRANS_APP_URL}/snap/v1/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Basic ${authString}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new AppError("error on create payment", 500);

        const data = await response.json();

        // await Promise.all([
        //     transactionService.createTransaction({
        //         transaction_id,
        //         gross_amount,
        //         customer_name,
        //         customer_email,
        //         snap_token: data.token,
        //         snap_redirect_url: data.token
        //     }),
        //     transactionService.createTransactionItems({
        //         products: productsFromDB,
        //         transaction_id
        //     })
        // ]);

        console.log(data)

        return prisma.payment.create({
            data: {
                method: req.method,
                status: req.status,
                amount: price,
                orderId: transactionId,
                updatedAt: new Date(),
            }
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        throw error;
    }
}