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

export const checkSeatAvailability = async (request) => {
    try {
        const seatIds = request.map(request => request.seatId);
        const seats = await Promise.all(seatIds.map(seatId => getSeatsById(seatId)));
        seats.forEach(seat => {
            if (seat.isOccupied) {
                throw new AppError(`Seat ${seat.seatNumber} is already occupied`, 400);
            }
        });
    } catch (error) {
        console.error('Error checking seat availability:', error);
        throw error;
    }
};

export const updateSeatOccupied = async (request, value) => {
    try {
        const seatIds = request.map(request => request.seatId);
        const updateSeats = seatIds.map(seatId => {
            return prisma.seat.update({
                where: {
                    id: seatId
                },
                data: {
                    isOccupied: value
                }
            });
        });
        return Promise.all(updateSeats);
    } catch (error) {
        console.error('Error updating seat occupied:', error);
        throw error;
    }
}