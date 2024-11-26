import * as flightService from "../services/flight.service.js";

//TODO Get all flights
export const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const { formattedFlights, pagination } = await flightService.getAll({ page, limit, search });

    res.status(200).json({
      success: true,
      message: "Flights fetched successfully",
      pagination,
      data: formattedFlights,
    });
  } catch (error) {
    next(error);
  }
};

// TODO Get flight by ID
export const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const flight = await flightService.getById(id);
    res.status(200).json({
      success: true,
      message: "Flight fetched successfully",
      data: flight,
    });
  } catch (error) {
    next(error);
  }
};

// TODO Store flight
export const store = async (req, res, next) => {
  try {
    const flight = await flightService.store(req, res);

    res.status(201).json({
      success: true,
      message: "Flight created successfully",
      data: flight,
    });
  } catch (error) {
    next(error);
  }
};

// TODO Update flight
export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedFlight = await flightService.update(req, id);

    res.status(200).json({
      success: true,
      message: "Flight updated successfully",
      data: updatedFlight,
    });
  } catch (error) {
    next(error);
  }
};

// TODO Destroy flight
export const destroy = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await flightService.destroy(id);
    res.status(200).json({
      success: true,
      message: "Flight deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
