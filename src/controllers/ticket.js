import { getTicketsByUserId, createTicket } from "../services/ticket.js";

export const getManyByUserId = async (req, res, next) => {
    try {
        req.user = {id: 1} // hardcoded for now will be deleted later, the template is, user: {id: x, name: xxx, ...}
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

export const create = async (req, res, next) => {
    try {
        const ticket = await createTicket(req.body);
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