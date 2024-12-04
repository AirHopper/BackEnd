import prisma from '../utils/prisma.js';

export const getOrdersByUserId = async (userId) => {
    try {
        return prisma.order.findMany({
            where: {
                userId
            },
            include: {
                Flight: true,
                Payment: true
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}

export const createOrder = async (request, paymentId, userId) => { 
    try {
        const returnTicketId = (request.isRoundTrip) ? request.returnTicketId : null;

        return prisma.order.create({
            data: {
                userId,
                paymentId,
                qrCodeUrl: 'test',
                isRoundTrip: request.isRoundTrip,
                outboundTicketId: request.outboundTicketId,
                returnTicketId,
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

export const updateOrderStatusByPaymentId = async (paymentId, paymentStatus) => {
    try {
        let orderStatus;
        switch (paymentStatus) {
            case 'settlement':
            case 'capture':
                orderStatus = 'Issued';
                break;
            case 'pending':
                orderStatus = 'Unpaid';
                break;
            case 'cancel':
            case 'deny':
                orderStatus = 'Cancelled';
                break;
            case 'expire':
                orderStatus = 'Expired';
                break;
            default:
                orderStatus = 'Unknown';
                break;
        }

        return prisma.order.update({
            where: {
                paymentId
            },
            data: {
                orderStatus
            },
            include: {
                Flight: true,
                Payment: true
            }
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}