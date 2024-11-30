import { getTicketsByUserId, createTicket } from "../services/ticket.service.js";
import { createPaymentByBankTransfer } from "../services/payment.service.js";
import { getById } from "../services/flight.service.js";

export const getManyByUserId = async (req, res, next) => {
    try {
        const tickets = await getTicketsByUserId(req.user.id); // req.user.id is set from auth middleware
        res.status(200).json({
            success: true,
            message: 'Tickets fetched successfully',
            data: tickets
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export const createByBank = async (req, res, next) => {
    try {
        const flight = await getById(req.body.flightId); //already has validation if flight not found
        const payment = await createPaymentByBankTransfer(req.body, flight.totalPrice, req.user.id);
        const ticket = await createTicket(req.body, payment.id, req.user.id);
        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            data: ticket
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}