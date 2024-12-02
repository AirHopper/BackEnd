import { PrismaClient, RegionType, Continent, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import haversine from "haversine";

const prisma = new PrismaClient();

async function seedAccounts() {
  const hashedPassword = await bcrypt.hash("12345678", 10);

  await prisma.account.createMany({
    data: [
      {
        email: "admin@example.com",
        password: hashedPassword,
        role: Role.Admin,
        isVerified: true,
      },
      {
        email: "buyer@example.com",
        password: hashedPassword,
        role: Role.Buyer,
        isVerified: true,
      },
    ],
  });

  const buyerAccount = await prisma.account.findUnique({
    where: { email: "buyer@example.com" },
  });
  if (buyerAccount) {
    await prisma.user.create({
      data: {
        accountId: buyerAccount.id,
        fullName: "buyerUser",
        phoneNumber: "1234567890",
      },
    });
  }
}

async function seedCities() {
  await prisma.city.createMany({
    data: [
      {
        name: "New York",
        code: "NYC",
        country: "United States",
        countryCode: "US",
        continent: Continent.North_America,
      },
      {
        name: "Los Angeles",
        code: "LAX",
        country: "United States",
        countryCode: "US",
        continent: Continent.North_America,
      },
      {
        name: "Singapore",
        code: "SIN",
        country: "Singapore",
        countryCode: "SG",
        continent: Continent.Asia,
      },
      {
        name: "Jakarta",
        code: "JKT",
        country: "Indonesia",
        countryCode: "ID",
        continent: Continent.Asia,
      },
      {
        name: "Bali",
        code: "DPS",
        country: "Indonesia",
        countryCode: "ID",
        continent: Continent.Asia,
      },
    ],
  });
}

async function seedAirports() {
  await prisma.airport.createMany({
    data: [
      {
        iataCode: "JFK",
        name: "John F. Kennedy International Airport",
        cityId: "NYC",
        latitude: 40.6413,
        longitude: -73.7781,
        type: RegionType.International,
      },
      {
        iataCode: "LAX",
        name: "Los Angeles International Airport",
        cityId: "LAX",
        latitude: 33.9416,
        longitude: -118.4085,
        type: RegionType.International,
      },
      {
        iataCode: "SIN",
        name: "Singapore Changi Airport",
        cityId: "SIN",
        latitude: 1.3644,
        longitude: 103.9915,
        type: RegionType.International,
      },
      {
        iataCode: "CGK",
        name: "Soekarno-Hatta International Airport",
        cityId: "JKT",
        latitude: -6.1256,
        longitude: 106.6559,
        type: RegionType.International,
      },
      {
        iataCode: "DPS",
        name: "Ngurah Rai International Airport",
        cityId: "DPS",
        latitude: -8.7482,
        longitude: 115.1675,
        type: RegionType.International,
      },
    ],
  });
}

async function seedRoutes() {
  const routes = [
    { departureAirportId: "JFK", arrivalAirportId: "LAX" },
    { departureAirportId: "JFK", arrivalAirportId: "SIN" },
    { departureAirportId: "LAX", arrivalAirportId: "SIN" },
    { departureAirportId: "SIN", arrivalAirportId: "CGK" },
    { departureAirportId: "CGK", arrivalAirportId: "DPS" },
  ];

  for (const route of routes) {
    const { departureAirportId, arrivalAirportId } = route;

    const departureAirport = await prisma.airport.findUnique({
      where: { iataCode: departureAirportId },
    });
    const arrivalAirport = await prisma.airport.findUnique({
      where: { iataCode: arrivalAirportId },
    });

    if (!departureAirport || !arrivalAirport) {
      console.error(
        `Could not find airports for route: ${departureAirportId} -> ${arrivalAirportId}`
      );
      continue;
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

    await prisma.route.create({
      data: {
        departureAirportId,
        arrivalAirportId,
        distance: parseFloat(distance.toFixed(2)),
      },
    });

    console.log(
      `Route created: ${departureAirportId} -> ${arrivalAirportId}, Distance: ${distance.toFixed(
        2
      )} km`
    );
  }
}

async function seedTerminals() {
  await prisma.terminal.createMany({
    data: [
      {
        name: "Terminal 1",
        type: RegionType.International,
        airportId: "JFK",
      },
      { name: "Terminal 2", type: RegionType.Domestic, airportId: "JFK" },
      {
        name: "Terminal 4",
        type: RegionType.International,
        airportId: "JFK",
      },
      { name: "Terminal 5", type: RegionType.Domestic, airportId: "JFK" },
      { name: "Terminal 1", type: RegionType.Domestic, airportId: "LAX" },
      {
        name: "Terminal 2",
        type: RegionType.International,
        airportId: "LAX",
      },
      {
        name: "Tom Bradley International Terminal",
        type: RegionType.International,
        airportId: "LAX",
      },
      {
        name: "Terminal 1",
        type: RegionType.International,
        airportId: "SIN",
      },
      {
        name: "Terminal 2",
        type: RegionType.International,
        airportId: "SIN",
      },
      {
        name: "Terminal 3",
        type: RegionType.International,
        airportId: "SIN",
      },
      {
        name: "Terminal 4",
        type: RegionType.International,
        airportId: "SIN",
      },
      { name: "Terminal 1", type: RegionType.Domestic, airportId: "CGK" },
      {
        name: "Terminal 2",
        type: RegionType.International,
        airportId: "CGK",
      },
      {
        name: "Terminal 3",
        type: RegionType.International,
        airportId: "CGK",
      },
      { name: "Terminal 1", type: RegionType.Domestic, airportId: "DPS" },
      {
        name: "Terminal 2",
        type: RegionType.International,
        airportId: "DPS",
      },
    ],
  });
}

async function seedAirlines() {
  await prisma.airline.createMany({
    data: [
      { iataCode: "AA", name: "American Airlines" },
      { iataCode: "SQ", name: "Singapore Airlines" },
      { iataCode: "DL", name: "Delta Airlines" },
      { iataCode: "GA", name: "Garuda Indonesia" },
      { iataCode: "QZ", name: "AirAsia Indonesia" },
    ],
  });
}

async function seedAirplanes() {
  await prisma.airplane.createMany({
    data: [
      {
        name: "Boeing 737",
        type: RegionType.Domestic,
        pricePerKm: 2000.0,
        airlineId: "AA",
      },
      {
        name: "Airbus A380",
        type: RegionType.International,
        pricePerKm: 3000.0,
        airlineId: "SQ",
      },
      {
        name: "Boeing 787 Dreamliner",
        type: RegionType.International,
        pricePerKm: 2500.0,
        airlineId: "DL",
      },
      {
        name: "Boeing 737 MAX",
        type: RegionType.Domestic,
        pricePerKm: 1800.0,
        airlineId: "GA",
      },
      {
        name: "Airbus A320",
        type: RegionType.Domestic,
        pricePerKm: 1500.0,
        airlineId: "QZ",
      },
    ],
  });
}

async function main() {
  try {
    await seedAccounts();
    await seedCities();
    await seedAirports();
    await seedRoutes();
    await seedTerminals();
    await seedAirlines();
    await seedAirplanes();

    console.log("Seeding completed successfully!");
  } catch (e) {
    console.error("Error during seeding:", e);
    throw e;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
