import { PrismaClient, RegionType, Continent, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import haversine from "haversine";

const prisma = new PrismaClient();

async function flightCapacity(classType) {
  // Define capacity based on classType
  return classType === "Economy"
    ? 72
    : classType === "Premium_economy"
    ? 24
    : classType === "Business"
    ? 18
    : 6;
}

async function store(flightData) {
  const {
    class: classType,
    discountId,
    departureTime,
    arrivalTime,
    price = 500,
  } = flightData;

  // Calculate capacity dynamically
  const capacity = await flightCapacity(classType);

  // Create the flight with nested Seat and Ticket
  return prisma.flight.create({
    data: {
      ...flightData,
      capacity,
      duration: (new Date(arrivalTime) - new Date(departureTime)) / 60000, // Duration in minutes
      price, // Base price or dynamic pricing logic here
      Seat: {
        create: Array.from({ length: capacity }, (_, index) => ({
          seatNumber: index + 1,
          isOccupied: false,
        })),
      },
      Ticket: {
        create: {
          routeId: flightData.routeId,
          class: classType,
          isTransits: false,
          departureTime: new Date(departureTime),
          arrivalTime: new Date(arrivalTime),
          totalPrice: price,
          discountPrice: discountId ? price * 0.9 : price, // Example discount logic (10% off if discountId exists)
          totalDuration:
            (new Date(arrivalTime) - new Date(departureTime)) / 60000, // Duration in minutes
          discountId,
        },
      },
    },
    include: {
      Seat: true,
      Ticket: true,
    },
  });
}

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
        continent: Continent.America,
      },
      {
        name: "Los Angeles",
        code: "LAX",
        country: "United States",
        countryCode: "US",
        continent: Continent.America,
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
    // Direct routes
    { departureAirportId: "JFK", arrivalAirportId: "LAX" },
    { departureAirportId: "JFK", arrivalAirportId: "SIN" },
    { departureAirportId: "LAX", arrivalAirportId: "SIN" },
    { departureAirportId: "SIN", arrivalAirportId: "CGK" },
    { departureAirportId: "CGK", arrivalAirportId: "DPS" },

    // Transit routes
    { departureAirportId: "JFK", arrivalAirportId: "CGK" }, // Transit possible via SIN = JFK -> SIN -> CGK
    { departureAirportId: "LAX", arrivalAirportId: "CGK" }, // Transit possible via SIN = LAX -> SIN -> CGK
    { departureAirportId: "JFK", arrivalAirportId: "DPS" }, // Transit possible via CGK or SIN = JFK -> CGK -> DPS or JFK -> SIN -> DPS
    { departureAirportId: "SIN", arrivalAirportId: "DPS" }, // Direct or transit via CGK = SIN -> DPS or SIN -> CGK -> DPS
    { departureAirportId: "LAX", arrivalAirportId: "DPS" }, // Transit possible via SIN or CGK = LAX -> SIN -> DPS or LAX -> CGK -> DPS
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

async function seedFlights() {
  try {
    const flights = [
      {
        routeId: 1, // JFK -> LAX
        class: "Economy",
        airplaneId: 1, // Boeing 737
        departureTime: "2024-12-10T08:00:00Z",
        arrivalTime: "2024-12-10T11:00:00Z",
        baggage: 20,
        cabinBaggage: 7,
        entertainment: true,
        departureTerminalId: 1, // JFK Terminal 1
        arrivalTerminalId: 5, // LAX Terminal 1
        discountId: null,
      },
      {
        routeId: 2, // JFK -> SIN
        class: "Business",
        airplaneId: 2, // Airbus A380
        departureTime: "2024-12-11T14:00:00Z",
        arrivalTime: "2024-12-12T04:00:00Z",
        baggage: 30,
        cabinBaggage: 10,
        entertainment: true,
        departureTerminalId: 4, // JFK Terminal 4
        arrivalTerminalId: 7, // SIN Terminal 2
        discountId: null,
      },
      {
        routeId: 3, // LAX -> SIN
        class: "Economy",
        airplaneId: 3, // Boeing 787 Dreamliner
        departureTime: "2024-12-13T10:00:00Z",
        arrivalTime: "2024-12-14T03:00:00Z",
        baggage: 25,
        cabinBaggage: 8,
        entertainment: true,
        departureTerminalId: 6, // LAX Terminal 2
        arrivalTerminalId: 8, // SIN Terminal 3
        discountId: null,
      },
      {
        routeId: 4, // SIN -> CGK
        class: "Economy",
        airplaneId: 4, // Boeing 737 MAX
        departureTime: "2024-12-15T07:00:00Z",
        arrivalTime: "2024-12-15T09:30:00Z",
        baggage: 20,
        cabinBaggage: 7,
        entertainment: false,
        departureTerminalId: 9, // SIN Terminal 1
        arrivalTerminalId: 12, // CGK Terminal 1
        discountId: null,
      },
      {
        routeId: 5, // CGK -> DPS
        class: "Economy",
        airplaneId: 5, // Airbus A320
        departureTime: "2024-12-16T12:00:00Z",
        arrivalTime: "2024-12-16T13:30:00Z",
        baggage: 15,
        cabinBaggage: 7,
        entertainment: false,
        departureTerminalId: 13, // CGK Terminal 3
        arrivalTerminalId: 15, // DPS Terminal 2
        discountId: null,
      },
    ];

    for (const flightData of flights) {
      const flight = await store(flightData);
      console.log(`Flight created:`, flight);
    }

    console.log("Flights seeded successfully!");
  } catch (error) {
    console.error("Error seeding flights:", error);
  }
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
    await seedFlights();

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
