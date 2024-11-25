import prisma from '../utils/prisma.js';
// import customError from '../utils/AppError.js';

export const getAllTickets = async () => {
    try {
        return await prisma.ticket.findMany();
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }
}

export const createTicket = async (req) => { 
    try {
        return await prisma.ticket.create({
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