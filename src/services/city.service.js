import prisma from "../utils/prisma.js";
import AppError from "../utils/AppError.js";
import imagekit from "../utils/imageKit.js";

// Create a new city
export const createCity = async (payload) => {
  try {
    const { code, name, country, countryCode, continent, file } = payload;

    const result = await imagekit.upload({
      file: file.buffer,
      fileName: `city_${code}_${Date.now()}`,
      folder: "/city/",
    });

    const newCity = await prisma.city.create({
      data: {
        code,
        name,
        country,
        countryCode,
        continent,
        imageUrl: result.url,
        imageId: result.fileId,
      },
    });

    return newCity;
  } catch (error) {
    console.error("Error creating city:", error);
    throw error;
  }
};

// Fetch all cities
export const getAllCities = async () => {
  try {
    const cities = await prisma.city.findMany();
    return cities;
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw error;
  }
};

// Fetch a single city by code
export const getCityByCode = async (code) => {
  try {
    const city = await prisma.city.findUnique({
      where: { code },
      include: { Airports: true },
    });

    if (!city) {
      throw new AppError("City not found", 404);
    }

    return city;
  } catch (error) {
    console.error("Error fetching city:", error);
    throw error;
  }
};

// Update a city
export const updateCity = async (code, payload) => {
  try {
    const city = await prisma.city.findUnique({
      where: { code },
    });

    if (!city) {
      throw new AppError("City not found", 404);
    }

    const updatedCity = await prisma.city.update({
      where: { code },
      data: payload,
    });

    return updatedCity;
  } catch (error) {
    console.error("Error updating city:", error);
    throw error;
  }
};

// Delete a city
export const deleteCity = async (code) => {
  try {
    const city = await prisma.city.findUnique({
      where: { code },
    });

    if (!city) {
      throw new AppError("City not found", 404);
    }

    await imagekit.deleteFile(city.imageId);

    await prisma.city.delete({
      where: { code },
    });

    return { message: `City with code ${code} deleted successfully` };
  } catch (error) {
    console.error("Error deleting city:", error);
    throw error;
  }
};
