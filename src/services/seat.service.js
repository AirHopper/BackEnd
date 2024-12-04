import prisma from '../utils/prisma.js';
import AppError from '../utils/AppError.js';

export const getSeatsById = async (id) => {
    try {
        return prisma.seat.findUnique({
            where: {
                id
            }
        });
    } catch (error) {
        console.error('Error fetching seats:', error);
        throw error;
    }
}

export const checkSeatAvailability = async (seatIds) => {
    try {
        const seats = await Promise.all(seatIds.map(seatId => getSeatsById(seatId)));
        return seats.find(seat => seat.isOccupied);
    } catch (error) {
        console.error('Error checking seat availability:', error);
        throw error;
    }
};

export const updateSeatOccupied = async (seatIds, value) => {
    try {
        return prisma.seat.updateMany({
            where: {
                id: {
                    in: seatIds
                }
            },
            data: {
                isOccupied: value
            }
        });
    } catch (error) {
        console.error('Error updating seat occupied:', error);
        throw error;
    }
}