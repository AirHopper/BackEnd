import * as airportService from "../services/airport.service.js";

// Create a new airport
export const createAirport = async (req, res, next) => {
  try {
    const airport = await airportService.createAirport(req.body);
    res.status(201).json({ message: "Airport created successfully", data: airport });
  } catch (error) {
    next(error);
  }
};

// Get all airports
export const getAllAirports = async (req, res, next) => {
  try {
    const airports = await airportService.getAllAirports();
    res.status(200).json({ data: airports });
  } catch (error) {
    next(error);
  }
};

// Get an airport by IATA code
export const getAirportByIataCode = async (req, res, next) => {
  try {
    const airport = await airportService.getAirportByIataCode(req.params.iataCode);
    res.status(200).json({ data: airport });
  } catch (error) {
    next(error);
  }
};

// Update an airport
export const updateAirport = async (req, res, next) => {
  try {
    const updatedAirport = await airportService.updateAirport(req.params.iataCode, req.body);
    res.status(200).json({ message: "Airport updated successfully", data: updatedAirport });
  } catch (error) {
    next(error);
  }
};

// Delete an airport
export const deleteAirport = async (req, res, next) => {
  try {
    const result = await airportService.deleteAirport(req.params.iataCode);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
