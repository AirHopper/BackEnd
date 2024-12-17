import * as ticketService from "../services/ticket.service.js";

// TODO Get all tickets
export const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, orderBy } = req.query;

    const { formattedTickets, pagination } = await ticketService.getAll({
      page,
      limit,
      search,
      orderBy,
    });

    res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      pagination,
      data: formattedTickets,
    });
  } catch (error) {
    next(error);
  }
};

// TODO Get ticket by ID
export const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const ticket = await ticketService.getById(id);
    res.status(200).json({
      success: true,
      message: "Ticket fetched successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// TODO Store ticket
export const store = async (req, res, next) => {
  try {
    const ticket = await ticketService.store(req.body);

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// TODO Destroy ticket
export const destroy = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await ticketService.destroy(id);

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
