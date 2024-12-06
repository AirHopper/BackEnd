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

async function calculateFlightPrice(flightData) {
  const { airplaneId, routeId, class: classType } = flightData;

  // Retrieve airplane to get price per km
  const airplane = await prisma.airplane.findUnique({
    where: { id: airplaneId },
  });

  if (!airplane) {
    throw new Error("Airplane not found for flight price calculation");
  }

  // Retrieve route to calculate distance
  const route = await prisma.route.findUnique({
    where: { id: routeId },
  });

  if (!route) {
    throw new Error("Route not found for flight price calculation");
  }

  let price = 0;

  // Calculate price based on distance and price per km
  price = route.distance * airplane.pricePerKm;

  // Price multiplier based on class type
  const economy = 1; // Default
  const premiumEconomy = 1.5; // 50% more expensive
  const business = 6; // 500% more expensive
  const firstClass = 17.5; // 1650% more expensive

  price *=
    classType === "Economy"
      ? economy
      : classType === "Premium_Economy"
      ? premiumEconomy
      : classType === "Business"
      ? business
      : firstClass;

  return price;
}

async function store(flightData) {
  const { class: classType, departureTime, arrivalTime } = flightData;

  // Calculate capacity dynamically
  const capacity = await flightCapacity(classType);

  // Calculate price based on airplane, route, and class type
  const price = await calculateFlightPrice(flightData);

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
          totalDuration:
            (new Date(arrivalTime) - new Date(departureTime)) / 60000, // Duration in minutes
        },
      },
    },
    include: {
      Seat: true,
      Ticket: true,
    },
  });
}

// Helper functions for ticket price and duration calculation
function calculateTicketPrice(flights) {
  let totalPrice = 0;

  for (const flight of flights) {
    
    totalPrice += parseInt(flight.price);
  }

  return totalPrice;
}

function calculateTicketDuration(flights) {
  let totalDuration = 0;

  for (const flight of flights) {
    totalDuration += parseInt(flight.duration);
  }

  return totalDuration;
}

// Function to create tickets
async function storeTicket(payload) {
  const { routeId, flightIds, discountId = null } = payload;

  // Retrieve flights based on flight IDs
  const flights = await prisma.flight.findMany({
    where: { id: { in: flightIds } },
  });

  if (!flights || flights.length === 0) {
    throw new Error("Flights not found for ticket creation");
  }

  // Calculate total price and duration
  const totalPrice = calculateTicketPrice(flights);
  const totalDuration = calculateTicketDuration(flights);

  // Create the ticket
  return prisma.ticket.create({
    data: {
      routeId,
      class: flights[0].class, // All flights have the same class in this scenario
      isTransits: flights.length > 1,
      departureTime: flights[0].departureTime,
      arrivalTime: flights[flights.length - 1].arrivalTime,
      totalPrice,
      totalDuration,
      Discount: discountId ? { connect: { id: discountId } } : undefined,
      Flights: {
        connect: flightIds.map((id) => ({ id })),
      },
    },
    include: {
      Flights: true,
      Discount: true,
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
        continent: Continent.Amerika,
      },
      {
        name: "Los Angeles",
        code: "LAX",
        country: "United States",
        countryCode: "US",
        continent: Continent.Amerika,
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
        name: "John F. Kennedy Internasional Airport",
        cityId: "NYC",
        latitude: 40.6413,
        longitude: -73.7781,
        type: RegionType.Internasional,
      },
      {
        iataCode: "LAX",
        name: "Los Angeles Internasional Airport",
        cityId: "LAX",
        latitude: 33.9416,
        longitude: -118.4085,
        type: RegionType.Internasional,
      },
      {
        iataCode: "SIN",
        name: "Singapore Changi Airport",
        cityId: "SIN",
        latitude: 1.3644,
        longitude: 103.9915,
        type: RegionType.Internasional,
      },
      {
        iataCode: "CGK",
        name: "Soekarno-Hatta Internasional Airport",
        cityId: "JKT",
        latitude: -6.1256,
        longitude: 106.6559,
        type: RegionType.Internasional,
      },
      {
        iataCode: "DPS",
        name: "Ngurah Rai Internasional Airport",
        cityId: "DPS",
        latitude: -8.7482,
        longitude: 115.1675,
        type: RegionType.Internasional,
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
    { departureAirportId: "JFK", arrivalAirportId: "CGK" }, // Transit possible via SIN = JFK -> SIN -> CGK => 2, 4
    { departureAirportId: "LAX", arrivalAirportId: "CGK" }, // Transit possible via SIN = LAX -> SIN -> CGK => 3, 4
    { departureAirportId: "JFK", arrivalAirportId: "DPS" }, // Transit possible via CGK or SIN = JFK -> CGK -> DPS => 6, 5  or JFK -> SIN -> DPS => 2, 8
    { departureAirportId: "SIN", arrivalAirportId: "DPS" }, // Transit via CGK = SIN -> CGK -> DPS => 4, 5
    { departureAirportId: "LAX", arrivalAirportId: "DPS" }, // Transit possible via SIN or CGK = LAX -> SIN -> DPS => 3, 8 or LAX -> CGK -> DPS => 7, 5
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
        type: RegionType.Internasional,
        airportId: "JFK",
      },
      { name: "Terminal 2", type: RegionType.Domestik, airportId: "JFK" },
      {
        name: "Terminal 4",
        type: RegionType.Internasional,
        airportId: "JFK",
      },
      { name: "Terminal 5", type: RegionType.Domestik, airportId: "JFK" },
      { name: "Terminal 1", type: RegionType.Domestik, airportId: "LAX" },
      {
        name: "Terminal 2",
        type: RegionType.Internasional,
        airportId: "LAX",
      },
      {
        name: "Tom Bradley Internasional Terminal",
        type: RegionType.Internasional,
        airportId: "LAX",
      },
      {
        name: "Terminal 1",
        type: RegionType.Internasional,
        airportId: "SIN",
      },
      {
        name: "Terminal 2",
        type: RegionType.Internasional,
        airportId: "SIN",
      },
      {
        name: "Terminal 3",
        type: RegionType.Internasional,
        airportId: "SIN",
      },
      {
        name: "Terminal 4",
        type: RegionType.Internasional,
        airportId: "SIN",
      },
      { name: "Terminal 1", type: RegionType.Domestik, airportId: "CGK" },
      {
        name: "Terminal 2",
        type: RegionType.Internasional,
        airportId: "CGK",
      },
      {
        name: "Terminal 3",
        type: RegionType.Internasional,
        airportId: "CGK",
      },
      { name: "Terminal 1", type: RegionType.Domestik, airportId: "DPS" },
      {
        name: "Terminal 2",
        type: RegionType.Internasional,
        airportId: "DPS",
      },
    ],
  });
}

async function seedAirlines() {
  await prisma.airline.createMany({
    data: [
      { iataCode: "AA", name: "Amerikan Airlines" },
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
        type: RegionType.Domestik,
        pricePerKm: 900.0,
        airlineId: "AA",
      },
      {
        name: "Airbus A380",
        type: RegionType.Internasional,
        pricePerKm: 600.0,
        airlineId: "SQ",
      },
      {
        name: "Boeing 787 Dreamliner",
        type: RegionType.Internasional,
        pricePerKm: 1200.0,
        airlineId: "DL",
      },
      {
        name: "Boeing 737 MAX",
        type: RegionType.Domestik,
        pricePerKm: 600.0,
        airlineId: "GA",
      },
      {
        name: "Airbus A320",
        type: RegionType.Domestik,
        pricePerKm: 800.0,
        airlineId: "QZ",
      },
    ],
  });
}

async function seedFlights() {
  try {
    const flights = [
      // Direct flights
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
      },
      {
        routeId: 6, // JFK -> CGK
        class: "Economy",
        airplaneId: 5, // Airbus A320
        departureTime: "2024-12-11T05:00:00Z",
        arrivalTime: "2024-12-11T13:00:00Z",
        baggage: 25,
        cabinBaggage: 8,
        entertainment: true,
        departureTerminalId: 1, // JFK Terminal 1
        arrivalTerminalId: 13, // CGK Terminal 3
      },
      {
        routeId: 10, // LAX -> DPS
        class: "Economy",
        airplaneId: 4, // Boeing 737 MAX
        departureTime: "2024-12-14T08:00:00Z",
        arrivalTime: "2024-12-14T17:00:00Z",
        baggage: 30,
        cabinBaggage: 10,
        entertainment: true,
        departureTerminalId: 6, // LAX Terminal 2
        arrivalTerminalId: 15, // DPS Terminal 2
      },
      {
        routeId: 8, // JFK -> DPS
        class: "Economy",
        airplaneId: 1, // Boeing 737
        departureTime: "2024-12-12T08:00:00Z",
        arrivalTime: "2024-12-12T17:00:00Z",
        baggage: 30,
        cabinBaggage: 10,
        entertainment: true,
        departureTerminalId: 1, // JFK Terminal 1
        arrivalTerminalId: 15, // DPS Terminal 2
      },

      // **Transit Flights**

      // JFK -> SIN -> CGK (Transit via SIN)
      {
        routeId: 2, // JFK -> SIN
        class: "Economy",
        airplaneId: 3, // Boeing 787 Dreamliner
        departureTime: "2024-12-11T01:00:00Z", // Same day, later than JFK->LAX arrival
        arrivalTime: "2024-12-11T09:00:00Z", // Adjust to match SIN arrival
        baggage: 20,
        cabinBaggage: 7,
        entertainment: true,
        departureTerminalId: 1, // JFK Terminal 1
        arrivalTerminalId: 7, // SIN Terminal 2
      },
      {
        routeId: 4, // SIN -> CGK
        class: "Economy",
        airplaneId: 4, // Boeing 737 MAX
        departureTime: "2024-12-11T10:00:00Z", // SIN -> CGK, after JFK -> SIN arrival
        arrivalTime: "2024-12-11T14:30:00Z",
        baggage: 20,
        cabinBaggage: 7,
        entertainment: false,
        departureTerminalId: 7, // SIN Terminal 2
        arrivalTerminalId: 12, // CGK Terminal 1
      },

      // LAX -> SIN -> DPS (Transit via SIN)
      {
        routeId: 3, // LAX -> SIN
        class: "Economy",
        airplaneId: 3, // Boeing 787 Dreamliner
        departureTime: "2024-12-14T08:00:00Z", // LAX -> SIN
        arrivalTime: "2024-12-14T15:00:00Z", // Adjust to match SIN arrival
        baggage: 25,
        cabinBaggage: 8,
        entertainment: true,
        departureTerminalId: 6, // LAX Terminal 2
        arrivalTerminalId: 7, // SIN Terminal 2
      },
      {
        routeId: 5, // SIN -> DPS
        class: "Economy",
        airplaneId: 5, // Airbus A320
        departureTime: "2024-12-14T17:00:00Z", // SIN -> DPS, after LAX -> SIN arrival
        arrivalTime: "2024-12-14T20:30:00Z",
        baggage: 25,
        cabinBaggage: 8,
        entertainment: false,
        departureTerminalId: 7, // SIN Terminal 3
        arrivalTerminalId: 15, // DPS Terminal 2
      },

      // JFK -> SIN -> DPS (Transit via SIN)
      {
        routeId: 2, // JFK -> SIN
        class: "Economy",
        airplaneId: 3, // Boeing 787 Dreamliner
        departureTime: "2024-12-12T02:00:00Z", // Same day as JFK -> LAX
        arrivalTime: "2024-12-12T11:00:00Z", // Adjust to match SIN arrival
        baggage: 30,
        cabinBaggage: 10,
        entertainment: true,
        departureTerminalId: 4, // JFK Terminal 4
        arrivalTerminalId: 7, // SIN Terminal 2
      },
      {
        routeId: 5, // SIN -> DPS
        class: "Economy",
        airplaneId: 5, // Airbus A320
        departureTime: "2024-12-12T12:00:00Z", // SIN -> DPS, after JFK -> SIN arrival
        arrivalTime: "2024-12-12T15:00:00Z",
        baggage: 30,
        cabinBaggage: 10,
        entertainment: false,
        departureTerminalId: 7, // SIN Terminal 2
        arrivalTerminalId: 15, // DPS Terminal 2
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

async function seedTickets() {
  try {
    // Create transit tickets for multi-flight routes
    const transitTickets = [
      { routeId: 6, flightIds: [9, 10] }, // JFK -> CGK (Transit via SIN)
      { routeId: 10, flightIds: [11, 12] }, // LAX -> DPS (Transit via SIN)
      { routeId: 8, flightIds: [13, 14] }, // JFK -> DPS (Transit via CGK)
    ];

    for (const ticketData of transitTickets) {
      const ticket = await storeTicket(ticketData);
      console.log(`Transit Ticket created:`, ticket);
    }

    console.log("Tickets seeded successfully!");
  } catch (error) {
    console.error("Error seeding tickets:", error);
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
    await seedTickets();

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
