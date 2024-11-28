import prisma from "../utils/prisma.js";
import imagekit from "../utils/imageKit.js";
import AppError from "../utils/AppError.js";

export const createAirline = async (data, file) => {
  try {
    const result = await imagekit.upload({
      file: file.buffer,
      fileName: `airline_${data.iataCode}_${Date.now()}`,
      folder: "/airline_images/",
    });

    const newAirline = await prisma.airline.create({
      data: {
        iataCode: data.iataCode,
        name: data.name,
        imageUrl: result.url,
        imageId: result.fileId,
      },
    });

    return newAirline;
  } catch (error) {
    console.error("Error creating airline:", error);
    throw error;
  }
};

export const getAllAirlines = async () => {
  try {
    const airlines = await prisma.airline.findMany();
    return airlines;
  } catch (error) {
    console.error("Error fetching airlines:", error);
    throw error;
  }
};

export const getAirlineById = async (iataCode) => {
  try {
    const airline = await prisma.airline.findUnique({
      where: { iataCode },
      include: { Airplanes: true },
    });

    if (!airline) {
      throw new AppError("Airline not found", 404);
    }

    return airline;
  } catch (error) {
    console.error("Error fetching airline:", error);
    throw error;
  }
};

export const updateAirlineDetails = async (iataCode, data) => {
  try {
    const airline = await prisma.airline.findUnique({ where: { iataCode } });

    if (!airline) {
      throw new AppError("Airline not found", 404);
    }

    const updatedAirline = await prisma.airline.update({
      where: { iataCode },
      data,
    });

    return updatedAirline;
  } catch (error) {
    console.error("Error updating airline details:", error);
    throw error;
  }
};

export const updateAirlinePhoto = async (iataCode, file) => {
  try {
    const airline = await prisma.airline.findUnique({ where: { iataCode } });

    if (!airline) {
      throw new AppError("Airline not found", 404);
    }

    let updatedImageData = {};
    if (file) {
      if (airline.imageId) {
        // Delete the old image if it exists
        await imagekit.deleteFile(airline.imageId);
      }

      const result = await imagekit.upload({
        file: file.buffer,
        fileName: `airline_${iataCode}_${Date.now()}`,
        folder: "/airline_images/",
      });

      updatedImageData = {
        imageUrl: result.url,
        imageId: result.fileId,
      };

      const updatedAirline = await prisma.airline.update({
        where: { iataCode },
        data: updatedImageData,
      });

      return updatedAirline;
    }

    throw new AppError("No file provided for updating photo", 400);
  } catch (error) {
    console.error("Error updating airline photo:", error);
    throw error;
  }
};

export const deleteAirline = async (iataCode) => {
  try {
    const airline = await prisma.airline.findUnique({ where: { iataCode } });

    if (!airline) {
      throw new AppError("Airline not found", 404);
    }

    if (airline.imageId) {
      await imagekit.deleteFile(airline.imageId);
    }

    await prisma.airline.delete({ where: { iataCode } });

    return {
      message: `Airline with IATA code ${iataCode} deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting airline:", error);
    throw error;
  }
};
