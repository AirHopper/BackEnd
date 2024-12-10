import prisma from "../utils/prisma.js";
import AppError from "../utils/AppError.js";

// Create a new airplane
export const createAirplane = async (data) => {
  try {
    const { airlineId, name, type, pricePerKm } = data;

    const newAirplane = await prisma.airplane.create({
      data: {
        Airline: { connect: { iataCode: airlineId } },
        name,
        type,
        pricePerKm,
      },
    });

    return newAirplane;
  } catch (error) {
    console.error("Error creating airplane:", error);
    throw error;
  }
};

// Get all airplanes
export const getAllAirplanes = async () => {
  try {
    const airplanes = await prisma.airplane.findMany({
      include: { Airline: true },
    });
    return airplanes;
  } catch (error) {
    console.error("Error fetching airplanes:", error);
    throw error;
  }
};

// Get an airplane by ID
export const getAirplaneById = async (id) => {
  try {
    const airplane = await prisma.airplane.findUnique({
      where: { id: parseInt(id, 10) },
      include: { Airline: true, Flights: true },
    });

    if (!airplane) {
      throw new AppError("Airplane not found", 404);
    }

    return airplane;
  } catch (error) {
    console.error("Error fetching airplane:", error);
    throw error;
  }
};

// Update an airplane
export const updateAirplane = async (id, data) => {
  try {
    const airplane = await prisma.airplane.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!airplane) {
      throw new AppError("Airplane not found", 404);
    }

    const updatedAirplane = await prisma.airplane.update({
      where: { id: parseInt(id, 10) },
      data,
    });

    return updatedAirplane;
  } catch (error) {
    console.error("Error updating airplane:", error);
    throw error;
  }
};

// Delete an airplane
export const deleteAirplane = async (id) => {
  try {
    const airplane = await prisma.airplane.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!airplane) {
      throw new AppError("Airplane not found", 404);
    }

    await prisma.airplane.delete({ where: { id: parseInt(id, 10) } });

    return { message: `Airplane with ID ${id} deleted successfully` };
  } catch (error) {
    console.error("Error deleting airplane:", error);
    throw error;
  }
};
