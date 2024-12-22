import prisma from "../utils/prisma.js";
import AppError from "../utils/AppError.js";

// Create a new terminal
export const createTerminal = async (data) => {
  try {
    const { name, type, airportId } = data;

    const newTerminal = await prisma.terminal.create({
      data: {
        name,
        type,
        Airport: { connect: { iataCode: airportId } },
      },
    });

    return newTerminal;
  } catch (error) {
    console.error("Error creating terminal:", error);
    throw error;
  }
};

// Get all terminals
export const getAllTerminals = async (airportId=null) => {
  try {
    let where = {};

    if (airportId) {
      where = {
        airportId: { contains: airportId },
      };
    }

    const terminals = await prisma.terminal.findMany({
      where,
      include: { Airport: true },
    });

    return terminals;
  } catch (error) {
    console.error("Error fetching terminals:", error);
    throw error;
  }
};

// Get a terminal by ID
export const getTerminalById = async (id) => {
  try {
    const terminal = await prisma.terminal.findUnique({
      where: { id: parseInt(id, 10) },
      include: { Airport: true, FlightsDeparture: true, FlightsArrival: true },
    });

    if (!terminal) {
      throw new AppError("Terminal not found", 404);
    }

    return terminal;
  } catch (error) {
    console.error("Error fetching terminal:", error);
    throw error;
  }
};

// Update a terminal
export const updateTerminal = async (id, data) => {
  try {
    const terminal = await prisma.terminal.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!terminal) {
      throw new AppError("Terminal not found", 404);
    }

    const updatedTerminal = await prisma.terminal.update({
      where: { id: parseInt(id, 10) },
      data,
    });

    return updatedTerminal;
  } catch (error) {
    console.error("Error updating terminal:", error);
    throw error;
  }
};

// Delete a terminal
export const deleteTerminal = async (id) => {
  try {
    const terminal = await prisma.terminal.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!terminal) {
      throw new AppError("Terminal not found", 404);
    }

    await prisma.terminal.delete({ where: { id: parseInt(id, 10) } });

    return { message: `Terminal with ID ${id} deleted successfully` };
  } catch (error) {
    console.error("Error deleting terminal:", error);
    throw error;
  }
};
