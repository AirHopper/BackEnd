import { getAllUserOwnedOrders, createOrder, getUserOwnedOrderById } from "../services/order.service.js";
import { cancelPaymentByOrderId, createPayment } from "../services/payment.service.js";
import { createPassengers } from "../services/passenger.service.js";
import { checkSeatAvailability, updateSeatOccupied } from "../services/seat.service.js";
import { getById } from "../services/ticket.service.js";
import { getUserProfile } from "../services/user.service.js";
import AppError from "../utils/AppError.js";

export const getAllUserOwned = async (req, res, next) => {
    try {
        const account = await getUserProfile(req.user.id); // req.user.id is accountId while user.id is userId
        const userId = account.user.id;
        const { search } = req.query;

        const orders = await getAllUserOwnedOrders({
            userId, 
            search
        });

        res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            data: orders
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

export const getUserOwnedById = async (req, res, next) => {
    try {
        const account = await getUserProfile(req.user.id); // req.user.id is accountId while user.id is userId
        const userId = account.user.id;
        const orderId = req.params.id
        const order = await getUserOwnedOrderById(orderId, userId);
        if (!order) throw new AppError('Order not found', 404);
        res.status(200).json({
            success: true,
            message: 'Order fetched successfully',
            data: order
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

export const create = async (req, res, next) => {
    try {
        const account = await getUserProfile(req.user.id); // req.user.id is accountId while user.id is userId
        const userId = account.user.id;
        if (isNaN(req.body.outboundTicketId)) throw new AppError('Invalid outbond ticket id', 400);
        if (req.body.returnTicketId) {
            if (isNaN(req.body.returnTicketId)) throw new AppError('Invalid return ticket id', 400);
        }

        const outboundTicket = await getById(req.body.outboundTicketId);
        if (!outboundTicket) throw new AppError('Outbond ticket not found', 404);
        if (req.body.returnTicketId) {
            const returnTicket = await getById(req.body.returnTicketId);
            if (!returnTicket) throw new AppError('Return ticket not found', 404);
        }

        const seats = req.body.passengers.flatMap(passenger => passenger.seatId);
        const occupiedSeat = await checkSeatAvailability(seats); // return undefined if seat is not occupied, while return the seat if it is occupied
        if (occupiedSeat) throw new AppError(`Seat ${occupiedSeat.seatNumber} on flight id ${occupiedSeat.flightId} is occupied`, 400);
        const payment = await createPayment(req.body, account);
        const order = await createOrder(req.body, payment.id, payment.orderId, userId);
        await updateSeatOccupied(seats, true);
        await createPassengers(req.body.passengers, order.id);
        const updatedOrder = await getUserOwnedOrderById(order.id, userId);
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

export const cancelUserOwnedById = async (req, res, next) => {
    try {
        const account = await getUserProfile(req.user.id); // req.user.id is accountId while user.id is userId
        const userId = account.user.id;
        const orderId = req.params.id;
        const order = await getUserOwnedOrderById(orderId, userId);
        if (!order) throw new AppError('Order not found', 404);
        if (order.orderStatus !== 'Unpaid') throw new AppError('Order cannot be cancelled', 400);
        const seatIds = order.passengers.flatMap(passenger => passenger.seat.map(seat => seat.id))
        await cancelPaymentByOrderId(orderId);
        await updateSeatOccupied(seatIds, false);
        return res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: {}
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}