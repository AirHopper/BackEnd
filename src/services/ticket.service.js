import prisma from '../utils/prisma.js';
// import customError from '../utils/AppError.js';

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

export const createTicket = async (req) => { 
    try {
        return prisma.ticket.create({
            data: {
                flightId: req.flightId,
                userId: req.userId,
                paymentId: req.paymentId,
                qrCodeUrl: req.qrCodeUrl,
                ticketStatus: req.ticketStatus
            }
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        throw error;
    }
}