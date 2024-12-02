import * as cityService from "../services/city.service.js";

export const createCity = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a city image" });
    }

    const city = await cityService.createCity(req.body, req.file);
    res.status(201).json({
      success: true,
      message: "City created successfully",
      data: city,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCities = async (req, res, next) => {
  try {
    const cities = await cityService.getAllCities();
    res.status(200).json({
      success: true,
      message: "Cities fetched successfully",
      data: cities,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getCityByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const city = await cityService.getCityByCode(code);
    res.status(200).json({
      success: true,
      message: "City fetched successfully",
      data: city,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCity = async (req, res, next) => {
  try {
    const { code } = req.params;
    const updatedCity = await cityService.updateCity(code, req.body);
    res.status(200).json({
      success: true,
      message: "City updated successfully",
      data: updatedCity,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCityPhoto = async (req, res, next) => {
  try {
    const { code } = req.params;
    const updatedCity = await cityService.updateCityPhoto(code, req.file);
    res.status(200).json({
      success: true,
      message: "City photo updated successfully",
      data: updatedCity,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCity = async (req, res, next) => {
  try {
    const { code } = req.params;
    const response = await cityService.deleteCity(code);
    res.status(200).json({
      success: true,
      message: "City deleted successfully",
      data: response,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
