import * as airlineService from "../services/airline.service.js";

// Create a new airline
export const createAirline = async (req, res, next) => {
  try {
    const newAirline = await airlineService.createAirline(req.body, req.file);
    res.status(201).json({
      message: "Airline created successfully",
      data: newAirline,
    });
  } catch (error) {
    next(error);
  }
};

// Get all airlines
export const getAllAirlines = async (req, res, next) => {
  try {
    const airlines = await airlineService.getAllAirlines();
    res.status(200).json({
      message: "Airlines fetched successfully",
      data: airlines,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single airline by IATA code
export const getAirlineById = async (req, res, next) => {
  try {
    const { iataCode } = req.params;
    const airline = await airlineService.getAirlineById(iataCode);
    res.status(200).json({
      message: "Airline fetched successfully",
      data: airline,
    });
  } catch (error) {
    next(error);
  }
};

// Update airline details
export const updateAirlineDetails = async (req, res, next) => {
  try {
    const { iataCode } = req.params;
    const updatedAirline = await airlineService.updateAirlineDetails(
      iataCode,
      req.body
    );
    res.status(200).json({
      message: "Airline details updated successfully",
      data: updatedAirline,
    });
  } catch (error) {
    next(error);
  }
};

// Update airline photo
export const updateAirlinePhoto = async (req, res, next) => {
  try {
    const { iataCode } = req.params;
    const updatedAirline = await airlineService.updateAirlinePhoto(
      iataCode,
      req.file
    );
    res.status(200).json({
      message: "Airline photo updated successfully",
      data: updatedAirline,
    });
  } catch (error) {
    next(error);
  }
};

// Delete an airline
export const deleteAirline = async (req, res, next) => {
  try {
    const { iataCode } = req.params;
    const response = await airlineService.deleteAirline(iataCode);
    res.status(200).json({
      message: response.message,
    });
  } catch (error) {
    next(error);
  }
};
