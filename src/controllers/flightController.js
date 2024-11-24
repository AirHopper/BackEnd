import { getAllFlights } from "../services/flightServices.js";

// Get all flights
export const getAll = async (req, res, next) => {
  try {
    const {
      flights,
      // pagination
    } = await getAllFlights();
    res.status(200).json({
      success: true,
      message: "Flights fetched successfully",
      data: flights,
      // pagination,
    });
  } catch (error) {
    next(error);
  }
};
