import prisma from "../utils/prisma.js";
import AppError from "../utils/AppError.js";
import haversine from "haversine";

// Create new route
export const createRoute = async (payload) => {
  try {
    const { departureAirportId, arrivalAirportId } = payload;

    const departureAirport = await prisma.airport.findUnique({
      where: { iataCode: departureAirportId },
    });

    const arrivalAirport = await prisma.airport.findUnique({
      where: { iataCode: arrivalAirportId },
    });

    // Validate airports
    if (!departureAirport) {
      throw new AppError(
        `Departure airport ${departureAirportId} not found`,
        404
      );
    }
    if (!arrivalAirport) {
      throw new AppError(`Arrival airport ${arrivalAirportId} not found`, 404);
    }

    // Calculate distance using haversine
    const distance = haversine(
      {
        latitude: parseFloat(departureAirport.latitude),
        longitude: parseFloat(departureAirport.longitude),
      },
      {
        latitude: parseFloat(arrivalAirport.latitude),
        longitude: parseFloat(arrivalAirport.longitude),
      },
      { unit: "km" }
    );

    // Create the route in the database
    const newRoute = await prisma.route.create({
      data: {
        DepartureAirport: {
          connect: {
            iataCode: departureAirportId,
          },
        },
        ArrivalAirport: {
          connect: {
            iataCode: arrivalAirportId,
          },
        },
        distance: parseFloat(distance.toFixed(2)),
      },
    });

    return newRoute;
  } catch (error) {
    console.error("Error creating route: ", error);
    if (error.code === "P2002") {
      throw new AppError("Route already exists", 400);
    }
    throw error;
  }
};

// Get all routes
export const getRoutes = async (queryParams) => {
  try {
    const { page = 1, pageSize = 10 } = queryParams;

    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(pageSize);

    const skip = (currentPage - 1) * itemsPerPage;

    const totalItems = await prisma.route.count();

    const routes = await prisma.route.findMany({
      skip,
      take: itemsPerPage,
      include: {
        DepartureAirport: {
          select: {
            name: true,
            City: {
              select: {
                code: true,
                name: true,
                country: true,
                countryCode: true,
              },
            },
          },
        },
        ArrivalAirport: {
          select: {
            name: true,
            City: {
              select: {
                code: true,
                name: true,
                country: true,
                countryCode: true,
              },
            },
          },
        },
      },
    });

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const metadata = {
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
    };

    return { metadata, routes };
  } catch (error) {
    console.error("Error getting routes: ", error);
    throw error;
  }
};

// Get a route by ID
export const getRoute = async (id) => {
  try {
    const route = await prisma.route.findUnique({ where: { id } });

    if (!route) {
      throw new AppError(`Route with id ${id} not found`, 404);
    }

    return route;
  } catch (error) {
    console.error("Error getting route: ", error);
    throw error;
  }
};

// Update a route
export const updateRoute = async (id, payload) => {
  try {
    const route = await prisma.route.findUnique({ where: { id } });

    if (!route) {
      throw new AppError(`Route ${id} not found`, 404);
    }

    // If either departureAirportId or arrivalAirportId changes, recalculate the distance
    if (payload.departureAirportId || payload.arrivalAirportId) {
      const departureAirportId =
        payload.departureAirportId || route.departureAirportId;
      const arrivalAirportId =
        payload.arrivalAirportId || route.arrivalAirportId;

      const departureAirport = await prisma.airport.findUnique({
        where: { iataCode: departureAirportId },
      });

      const arrivalAirport = await prisma.airport.findUnique({
        where: { iataCode: arrivalAirportId },
      });

      if (!departureAirport) {
        throw new AppError(
          `Departure airport ${departureAirportId} not found`,
          404
        );
      }
      if (!arrivalAirport) {
        throw new AppError(
          `Arrival airport ${arrivalAirportId} not found`,
          404
        );
      }

      const distance = haversine(
        {
          latitude: parseFloat(departureAirport.latitude),
          longitude: parseFloat(departureAirport.longitude),
        },
        {
          latitude: parseFloat(arrivalAirport.latitude),
          longitude: parseFloat(arrivalAirport.longitude),
        },
        { unit: "km" }
      );

      payload.distance = parseFloat(distance.toFixed(2));
    }

    const updatedRoute = await prisma.route.update({
      where: { id },
      data: payload,
    });

    return updatedRoute;
  } catch (error) {
    console.error("Error updating route: ", error);
    if (error.code === "P2002") {
      throw new AppError("Route already exists", 400);
    }
    throw error;
  }
};

// Delete a route
export const deleteRoute = async (id) => {
  try {
    const route = await prisma.route.findUnique({ where: { id } });

    if (!route) {
      throw new AppError(`Route ${id} not found`, 404);
    }

    await prisma.route.delete({ where: { id } });

    return route;
  } catch (error) {
    console.error("Error deleting route: ", error);
    throw error;
  }
};
