import * as airplaneService from "../services/airplane.service.js";

// Create a new airplane
export const createAirplane = async (req, res, next) => {
  try {
    const airplane = await airplaneService.createAirplane(req.body);
    res.status(201).json({
      success: true,
      message: "Airplane created successfully",
      data: airplane,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// Get all airplanes
export const getAllAirplanes = async (req, res, next) => {
  try {
    const airplanes = await airplaneService.getAllAirplanes(req.query.airlineId);
    res
      .status(200)
      .json({
        success: true,
        message: "Airplanes fetched successfully",
        data: airplanes,
        error: null,
      });
  } catch (error) {
    next(error);
  }
};

// Get an airplane by ID
export const getAirplaneById = async (req, res, next) => {
  try {
    const airplane = await airplaneService.getAirplaneById(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        message: "Airplane fetched successfully",
        data: airplane,
        error: null,
      });
  } catch (error) {
    next(error);
  }
};

// Update an airplane
export const updateAirplane = async (req, res, next) => {
  try {
    const updatedAirplane = await airplaneService.updateAirplane(
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Airplane updated successfully",
      data: updatedAirplane,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// Delete an airplane
export const deleteAirplane = async (req, res, next) => {
  try {
    const result = await airplaneService.deleteAirplane(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        message: "Airplane deleted successfully",
        data: result,
        error: null,
      });
  } catch (error) {
    next(error);
  }
};
