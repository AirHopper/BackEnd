import { getAllFlights, getFlightById, createFlight } from "../services/flightServices.js";

//TODO Get all flights
export const getAll = async (req, res, next) => {
  try {
    const {
      formattedFlights,
      // pagination
    } = await getAllFlights();
    res.status(200).json({
      success: true,
      message: "Flights fetched successfully",
      data: formattedFlights,
      // pagination,
    });
  } catch (error) {
    next(error);
  }
};

// TODO Get flight by ID
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const flight = await getFlightById(id);
    res.status(200).json({
      success: true,
      message: "Flight fetched successfully",
      data: flight,
    });
  } catch (error) {
    next(error);
  }
};

// TODO Search flights at parameters query

// TODO Create flight
export const create = async (req, res, next) => {
  try {
    const flight = await createFlight(req, res);

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

// TODO Delete flight
