import prisma from "../utils/prisma.js";
import AppError from "../utils/AppError.js";

// Create a new airport
export const createAirport = async (data) => {
  try {
    const { iataCode, name, latitude, longitude, type, cityId } = data;

    const newAirport = await prisma.airport.create({
      data: {
        iataCode,
        name,
        latitude,
        longitude,
        type,
        city: { connect: { code: cityId } }, 
      },
    });

    return newAirport;
  } catch (error) {
    console.error("Error creating airport:", error);
    throw error;
  }
};

// Get all airports
export const getAllAirports = async () => {
  try {
    const airports = await prisma.airport.findMany({
      include: { City: true },
    });
    return airports;
  } catch (error) {
    console.error("Error fetching airports:", error);
    throw error;
  }
};

// Get an airport by IATA code
export const getAirportByIataCode = async (iataCode) => {
  try {
    const airport = await prisma.airport.findUnique({
      where: { iataCode },
      include: { City: true, Terminals: true, departureRoutes: true, arrivalRoutes: true },
    });

    if (!airport) {
      throw new AppError("Airport not found", 404);
    }

    return airport;
  } catch (error) {
    console.error("Error fetching airport:", error);
    throw error;
  }
};

// Update an airport
export const updateAirport = async (iataCode, data) => {
  try {
    const airport = await prisma.airport.findUnique({ where: { iataCode } });

    if (!airport) {
      throw new AppError("Airport not found", 404);
    }

    const updatedAirport = await prisma.airport.update({
      where: { iataCode },
      data,
    });

    return updatedAirport;
  } catch (error) {
    console.error("Error updating airport:", error);
    throw error;
  }
};

// Delete an airport
export const deleteAirport = async (iataCode) => {
  try {
    const airport = await prisma.airport.findUnique({ where: { iataCode } });

    if (!airport) {
      throw new AppError("Airport not found", 404);
    }

    await prisma.airport.delete({ where: { iataCode } });

    return { message: `Airport with IATA code ${iataCode} deleted successfully` };
  } catch (error) {
    console.error("Error deleting airport:", error);
    throw error;
  }
};
