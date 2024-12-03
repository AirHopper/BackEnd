import * as airportService from "../services/airport.service.js";

// Create a new airport
export const createAirport = async (req, res, next) => {
  try {
    const airport = await airportService.createAirport(req.body);
    res.status(201).json({ success: true, message: "Airport created successfully", data: airport, error: null });
  } catch (error) {
    next(error);
  }
};

// Get all airports
export const getAllAirports = async (req, res, next) => {
  try {
    const airports = await airportService.getAllAirports();
    res.status(200).json({ success: true, message: "Airports fetched successfully", data: airports,  error: null });
  } catch (error) {
    next(error);
  }
};

// Get an airport by IATA code
export const getAirportByIataCode = async (req, res, next) => {
  try {
    const airport = await airportService.getAirportByIataCode(req.params.iataCode);
    res.status(200).json({ success: true,message: "Airport fetched successfully", data: airport,  error: null });
  } catch (error) {
    next(error);
  }
};

// Update an airport
export const updateAirport = async (req, res, next) => {
  try {
    const updatedAirport = await airportService.updateAirport(req.params.iataCode, req.body);
    res.status(200).json({ success: true, message: "Airport updated successfully", data: updatedAirport, error: null });
  } catch (error) {
    next(error);
  }
};

// Delete an airport
export const deleteAirport = async (req, res, next) => {
  try {
    const result = await airportService.deleteAirport(req.params.iataCode);
    res.status(200).json({ success: true, message: "Airport deleted successfully", data: result, error: null });
  } catch (error) {
    next(error);
  }
};
