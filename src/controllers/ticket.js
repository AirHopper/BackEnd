import { getAllTickets, createTicket } from "../services/ticket.js";

export const getAll = async (req, res, next) => {
    try {
        const tickets = await getAllTickets();
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

export const create = async (req, res, next) => {
    try {
        const ticket = createTicket(req.body);
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