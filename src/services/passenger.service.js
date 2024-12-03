import prisma from '../utils/prisma.js';

export const createPassengers = async (request, ticketId) => { 
    try {
        const passengers = request.map(passenger => ({
            ...passenger,
            ticketId
        }));
        
        return prisma.passenger.createMany({ //return { count } not passenger's data
            data: passengers,
        });
    } catch (error) {
        console.error('Error creating passenger:', error);
        throw error;
    }
}

export const getPassegersByTicketId = async (ticketId) => {
    try {
        return prisma.passenger.findMany({
            where: {
                ticketId
            }
        });
    } catch (error) {
        console.error('Error fetching passengers:', error);
        throw error;
    }
}