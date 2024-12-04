import { getOrdersByUserId, createOrder } from "../services/order.service.js";
import { createPaymentByBankTransfer, createPaymentByCreditCard } from "../services/payment.service.js";
import { createPassengers } from "../services/passenger.service.js";
import { checkSeatAvailability, updateSeatOccupied } from "../services/seat.service.js";
import { getById } from "../services/ticket.service.js";

import AppError from "../utils/AppError.js";

export const getManyByUserId = async (req, res, next) => {
    try {
        const orders = await getOrdersByUserId(req.user.id); // req.user.id is set from auth middleware
        res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            data: orders
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export const createByBank = async (req, res, next) => {
    try {
        if (isNaN(req.body.outbondTicketId)) throw new AppError('Invalid outbond ticketId', 400);
        if (req.isRoundTrip) {
            if (isNaN(req.body.returnTicketId)) throw new AppError('Invalid return ticketId', 400);
        }

        const outbondTicket = await getById(req.body.outbondTicketId);
        if (!outbondTicket) throw new AppError('Outbond ticket not found', 404);
        if (req.isRoundTrip) {
            const returnTicket = await getById(req.body.returnTicketId);
            if (!returnTicket) throw new AppError('Return ticket not found', 404);
        }

        const seats = req.body.passengers.flatMap(passenger => passenger.seatId);
        const occupiedSeat = await checkSeatAvailability(seats); // return undefined if seat is not occupied, while return the seat if it is occupied
        if (occupiedSeat) throw new AppError(`Seat ${occupiedSeat.seatNumber} on flightId ${occupiedSeat.flightId} is occupied`, 400);
        const payment = await createPaymentByBankTransfer(req.body);
        
        const order = await createOrder(req.body, payment.id, req.user.id);
        await updateSeatOccupied(req.body.passengers, true);
        await createPassengers(req.body.passengers, order.id);
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export const createByCreditCard = async (req, res, next) => {
    try {
        // const flightId = parseInt(req.params.flightId);
        // if (isNaN(flightId)) throw new AppError('Invalid flightId', 400);
        // const flight = await getById(flightId); //already has validation if flight not found
        // await checkSeatAvailability(req.body.passengers);
        // const payment = await createPaymentByCreditCard(req.body, flight.totalPrice);
        // const order = await createOrder(flightId, payment.id, req.user.id);
        // await updateSeatOccupied(req.body.passengers, true);
        // await createPassengers(req.body.passengers, order.id);
        // res.status(201).json({
        //     success: true,
        //     message: 'Order created successfully',
        //     data: order
        // });
    } catch (error) {
        console.log(error);
        next(error);
    }
}