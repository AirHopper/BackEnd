import { getAllFlights } from "../services/flightServices.js";
import AppError from "../utils/AppError.js";

// Get all flights
export const getAll = async (req, res) => {
  try {
    const flights = await getAllFlights();
    res.status(200).json({
      success: true,
      message: "Flights fetched successfully",
      data: flights,
    });
  } catch (err) {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err instanceof AppError ? err.message : "Internal Server Error";

    res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};
