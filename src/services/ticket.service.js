import prisma from '../utils/prisma.js';

export const getTicketsByUserId = async (userId) => {
    try {
        return prisma.ticket.findMany({
            where: {
                userId
            },
            include: {
                Flight: true,
                Payment: true
            }
        });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }
}

export const createTicket = async (flightId, paymentId, userId) => { 
    try {
        return prisma.ticket.create({
            data: {
                userId,
                paymentId,
                flightId,
                qrCodeUrl: 'test',
                ticketStatus: 'Unpaid'
            },
            include: {
                Flight: true,
                Payment: true
            }
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        throw error;
    }
}

export const updateTicketStatusByPaymentId = async (paymentId, paymentStatus) => {
    try {
        let ticketStatus;
        switch (paymentStatus) {
            case 'settlement':
            case 'capture':
                ticketStatus = 'Paid';
                break;
            case 'pending':
                ticketStatus = 'Unpaid';
                break;
            case 'cancel':
            case 'deny':
                ticketStatus = 'Cancelled';
                break;
            case 'expire':
                ticketStatus = 'Expired';
                break;
            default:
                ticketStatus = 'Unknown';
                break;
        }

        return prisma.ticket.update({
            where: {
                paymentId
            },
            data: {
                ticketStatus
            },
            include: {
                Flight: true,
                Payment: true
            }
        });
    } catch (error) {
        console.error('Error updating ticket status:', error);
        throw error;
    }
}