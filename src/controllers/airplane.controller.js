import * as airplaneService from "../services/airplane.service.js";

// Create a new airplane
export const createAirplane = async (req, res, next) => {
  try {
    const airplane = await airplaneService.createAirplane(req.body);
    res.status(201).json({ message: "Airplane created successfully", data: airplane });
  } catch (error) {
    next(error);
  }
};

// Get all airplanes
export const getAllAirplanes = async (req, res, next) => {
  try {
    const airplanes = await airplaneService.getAllAirplanes();
    res.status(200).json({ data: airplanes });
  } catch (error) {
    next(error);
  }
};

// Get an airplane by ID
export const getAirplaneById = async (req, res, next) => {
  try {
    const airplane = await airplaneService.getAirplaneById(req.params.id);
    res.status(200).json({ data: airplane });
  } catch (error) {
    next(error);
  }
};

// Update an airplane
export const updateAirplane = async (req, res, next) => {
  try {
    const updatedAirplane = await airplaneService.updateAirplane(req.params.id, req.body);
    res.status(200).json({ message: "Airplane updated successfully", data: updatedAirplane });
  } catch (error) {
    next(error);
  }
};

// Delete an airplane
export const deleteAirplane = async (req, res, next) => {
  try {
    const result = await airplaneService.deleteAirplane(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
