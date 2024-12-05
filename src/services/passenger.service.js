import prisma from '../utils/prisma.js';

export const createPassengers = async (request, orderId) => { 
    try {
        const passengers = request.flatMap(passenger => 
            passenger.seatId.map(seat => ({
                ...passenger,
                seatId: seat,
                orderId
            }))
        );

        console.log(passengers);
        
        return prisma.passenger.createMany({ //return { count } not passenger's data
            data: passengers,
        });
    } catch (error) {
        console.error('Error creating passenger:', error);
        throw error;
    }
}

export const getPassegersByOrderId = async (orderId) => {
    try {
        return prisma.passenger.findMany({
            where: {
                orderId
            }
        });
    } catch (error) {
        console.error('Error fetching passengers:', error);
        throw error;
    }
}