import { PrismaClient, RegionType, Continent, Role } from "@prisma/client";
import haversine from "haversine";
import { nanoid } from "nanoid";
import { hashPassword } from "../src/utils/bcrypt";

const prisma = new PrismaClient();

async function flightCapacity(classType) {
  // Define capacity based on classType
  return classType === "Economy"
    ? 72
    : classType === "Premium_Economy"
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

async function store(flightData, discountId = null) {
  const { class: classType, departureTime, arrivalTime } = flightData;

  // Calculate capacity dynamically
  const capacity = await flightCapacity(classType);

  // Calculate price based on airplane, route, and class type
  const price = await calculateFlightPrice(flightData);
  let ticketPrice = price;

  if (discountId) {
    const discount = await prisma.discount.findUnique({
      where: { id: discountId },
    });
    ticketPrice -= (price * discount.percentage) / 100;
  }

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
          totalPrice: ticketPrice,
          discountId,
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
  let totalPrice = calculateTicketPrice(flights);
  const totalDuration = calculateTicketDuration(flights);

  if (discountId) {
    const discount = await prisma.discount.findUnique({
      where: { id: discountId },
    });
    totalPrice -= (totalPrice * discount.percentage) / 100;
  }

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
      discountId,
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
  const hashedPassword = await hashPassword('12345678');

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

async function seedNotifications() {
  try {
    // Find the buyer account
    const buyerAccount = await prisma.account.findUnique({
      where: { email: "buyer@example.com" },
    });

    if (!buyerAccount) {
      console.error("Buyer account not found. Notifications cannot be seeded.");
      return;
    }

    // Seed notifications for the buyer account
    const notifications = [
      {
        accountId: buyerAccount.id,
        type: "Promosi",
        title: "Special Discount Offer!",
        description:
          "Get 20% off on your next booking. Offer valid until December 31st.",
        isRead: false,
      },
      {
        accountId: buyerAccount.id,
        type: "Notifikasi",
        title: "Payment Successful",
        description:
          "Your payment for order #12345 has been successfully processed.",
        isRead: false,
      },
      {
        accountId: buyerAccount.id,
        type: "Promosi",
        title: "Refer & Earn",
        description:
          "Refer a friend and earn reward points on their first purchase.",
        isRead: false,
      },
      {
        accountId: buyerAccount.id,
        type: "Notifikasi",
        title: "Booking Confirmation",
        description:
          "Your booking for flight #ABC123 has been confirmed. Check your email for details.",
        isRead: false,
      },
    ];

    // Create the notifications in the database
    await prisma.notification.createMany({
      data: notifications,
    });

    console.log("4 notifications seeded successfully for the buyer account.");
  } catch (error) {
    console.error("Error seeding notifications:", error);
  }
}

async function seedDiscounts() {
  try {
    const discounts = [
      { percentage: 15 },
      { percentage: 25 },
      { percentage: 50 },
      { percentage: 75 },
    ];

    await prisma.discount.createMany({
      data: discounts,
    });

    console.log("Discounts seeded successfully!");
  } catch (error) {
    console.error("Error seeding discounts:", error);
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
        imageUrl:
          "https://i.natgeofe.com/k/5b396b5e-59e7-43a6-9448-708125549aa1/new-york-statue-of-liberty.jpg",
      },
      {
        name: "Los Angeles",
        code: "LAX",
        country: "United States",
        countryCode: "US",
        continent: Continent.Amerika,
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/20190616154621%21Echo_Park_Lake_with_Downtown_Los_Angeles_Skyline.jpg/800px-20190616154621%21Echo_Park_Lake_with_Downtown_Los_Angeles_Skyline.jpg",
      },
      {
        name: "Singapore",
        code: "SIN",
        country: "Singapore",
        countryCode: "SG",
        continent: Continent.Asia,
        imageUrl:
          "https://cdn0-production-images-kly.akamaized.net/gQGm2S2sX_HV5GdTNugjWm9wGAM=/1200x675/smart/filters:quality(75):strip_icc():format(webp)/kly-media-production/medias/2385815/original/045137000_1539769271-1.jpg",
      },
      {
        name: "Jakarta",
        code: "JKT",
        country: "Indonesia",
        countryCode: "ID",
        continent: Continent.Asia,
        imageUrl:
          "https://i0.wp.com/mytravelation.com/wp-content/uploads/2023/11/Jakarta.jpeg",
      },
      {
        name: "Bali",
        code: "DPS",
        country: "Indonesia",
        countryCode: "ID",
        continent: Continent.Asia,
        imageUrl:
          "https://ik.imagekit.io/tvlk/blog/2023/09/shutterstock_631736717.jpg?tr=c-at_max",
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
    { departureAirportId: "CGK", arrivalAirportId: "SIN" },
    { departureAirportId: "DPS", arrivalAirportId: "SIN" },

    // Transit routes
    { departureAirportId: "JFK", arrivalAirportId: "CGK" }, // Transit possible via SIN = JFK -> SIN -> CGK => 2, 4 or JFK -> LAX -> SIN -> CGK => 1, 3, 4
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
      {
        iataCode: "AA",
        name: "Amerikan Airlines",
        imageUrl:
          "https://s202.q4cdn.com/986123435/files/doc_downloads/logos/american-airlines/THUMB-aa_aa__ahz_4cp_grd_pos-(1).png",
      },
      {
        iataCode: "SQ",
        name: "Singapore Airlines",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Singapore_Airlines_Logo_2.svg/1200px-Singapore_Airlines_Logo_2.svg.png",
      },
      {
        iataCode: "DL",
        name: "Delta Airlines",
        imageUrl:
          "https://download.logo.wine/logo/Delta_Air_Lines/Delta_Air_Lines-Logo.wine.png",
      },
      {
        iataCode: "GA",
        name: "Garuda Indonesia",
        imageUrl:
          "https://e7.pngegg.com/pngimages/513/980/png-clipart-logo-garuda-indonesia-persero-tbk-airline-brand-garuda-indonesia-company-text.png",
      },
      {
        iataCode: "QZ",
        name: "AirAsia Indonesia",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/f/f5/AirAsia_New_Logo.svg",
      },
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
      {
        routeId: 4, 
        class: "Economy",
        airplaneId: 4,
        departureTime: "2024-12-17T08:00:00Z",
        arrivalTime: "2024-12-17T11:00:00Z",
        baggage: 20,
        cabinBaggage: 7,
        entertainment: true,
        departureTerminalId: 8,
        arrivalTerminalId: 12,
      },
      {
        routeId: 6, 
        class: "Economy",
        airplaneId: 4,
        departureTime: "2024-12-16T08:00:00Z",
        arrivalTime: "2024-12-16T11:00:00Z",
        baggage: 20,
        cabinBaggage: 7,
        entertainment: true,
        departureTerminalId: 8,
        arrivalTerminalId: 12,
      },

      // **Transit Flights**

      // CGK -> DPS -> SIN (Transit via DPS)
      {
        routeId: 5, // CGK -> DPS
        class: "Economy",
        airplaneId: 4, // Boeing 737 MAX
        departureTime: "2024-12-16T10:00:00Z",
        arrivalTime: "2024-12-16T12:30:00Z",
        baggage: 15,
        cabinBaggage: 7,
        entertainment: false,
        departureTerminalId: 13, // CGK Terminal 3
        arrivalTerminalId: 15, // DPS Terminal 2
      },
      {
        routeId: 7, // DPS -> SIN
        class: "Economy",
        airplaneId: 5, // Airbus A320
        departureTime: "2024-12-16T13:00:00Z", // DPS -> SIN, after CGK -> DPS arrival
        arrivalTime: "2024-12-16T15:00:00Z",
        baggage: 15,
        cabinBaggage: 7,
        entertainment: false,
        departureTerminalId: 15, // DPS Terminal 2
        arrivalTerminalId: 7, // SIN Terminal 2
      },
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

      // JFK -> LAX -> SIN -> CGK (Transit via LAX and SIN)
      {
        routeId: 1, // JFK -> LAX
        class: "Economy",
        airplaneId: 1, // Boeing 737
        departureTime: "2024-12-16T08:00:00Z",
        arrivalTime: "2024-12-16T11:00:00Z",
        baggage: 20,
        cabinBaggage: 7,
        entertainment: true,
        departureTerminalId: 1, // JFK Terminal 1
        arrivalTerminalId: 5, // LAX Terminal 1
      },
      {
        routeId: 3, // LAX -> SIN
        class: "Economy",
        airplaneId: 3, // Boeing 787 Dreamliner
        departureTime: "2024-12-16T12:00:00Z", // LAX -> SIN
        arrivalTime: "2024-12-16T19:00:00Z", // Adjust to match SIN arrival
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
        departureTime: "2024-12-16T19:30:00Z", // SIN -> CGK, after LAX -> SIN arrival
        arrivalTime: "2024-12-16T22:30:00Z",
        baggage: 20,
        cabinBaggage: 7,
        entertainment: false,
        departureTerminalId: 8, // SIN Terminal 3
        arrivalTerminalId: 12, // CGK Terminal 1
      },
    ];

    // Random discount Id
    const discountIds = [null, 1, 2, 3, 4];

    for (const flightData of flights) {
      const flight = await store(
        flightData,
        discountIds[Math.floor(Math.random() * discountIds.length)]
      );
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
      { routeId: 6, flightIds: [11, 12], discountId: 1 },
      { routeId: 8, flightIds: [13, 14], discountId: 1 }, // JFK -> CGK (Transit via SIN)
      { routeId: 12, flightIds: [15, 16], discountId: 3 }, // LAX -> DPS (Transit via SIN)
      { routeId: 10, flightIds: [17, 18] }, // JFK -> DPS (Transit via CGK)
      { routeId: 8, flightIds: [19, 20, 21], discountId: 2 }, // JFK -> CGK (Transit via LAX and SIN)
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

async function seedOrders() {
  try {
    const user = await prisma.user.findFirst({
      where: { fullName: "buyerUser" },
    });

    const tickets = await prisma.ticket.findMany({
      include: {
        Flights: {
          include: {
            Seat: true, // Fetch seats for each flight
          },
        },
      },
      take: 10, // Fetch more tickets to create multiple orders
    });

    if (!user || tickets.length < 6) {
      console.error(
        "Required data (user or at least 6 tickets) not found for seeding orders."
      );
      return;
    }

    const orders = [];

    for (let i = 0; i < 3; i++) {
      // Create 3 distinct orders
      // Create a payment for the order
      const payment = await prisma.payment.create({
        data: {
          method: i % 2 === 0 ? "credit_card" : "e_wallet",
          status: i % 2 === 0 ? "settlement" : "pending",
          amount: 500 + i * 100, // Dynamic amount
          token: `example-payment-token-${i}`,
          transactionId: `txn_12345_${i}`,
          orderId: `order_12345_${i}`,
          validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
        },
      });

      // Calculate detailPrice for the order
      const detailPrice = [
        {
          amount: 2, // Two adults
          type: "Dewasa",
          totalPrice: 500 + i * 100, // Example price calculation
        },
        {
          amount: 1, // One child
          type: "Anak",
          totalPrice: 250 + i * 50,
        },
        {
          amount: 1, // One infant (not assigned a seat)
          type: "Bayi",
          totalPrice: 100,
        },
      ];

      // Extract all flights and seats for the outbound ticket
      const outboundFlights = tickets[i * 2]?.Flights || [];
      const outboundSeats = outboundFlights.flatMap((flight) => flight.Seat);

      // Extract all flights and seats for the return ticket
      const returnFlights = tickets[i * 2 + 1]?.Flights || [];
      const returnSeats = returnFlights.flatMap((flight) => flight.Seat);

      // Ensure there are enough seats for passengers (excluding the infant)
      if (outboundSeats.length < 2 || returnSeats.length < 1) {
        // 2 seats needed for adults, 1 seat for the child (ignoring the infant who doesn't need a seat)
        console.error(`Not enough seats for order ${i}.`);
        continue;
      }

      // Generate a random string for order ID using nanoid

      // Create the order
      const order = await prisma.order.create({
        data: {
          id: nanoid(8),
          userId: user.id,
          paymentId: payment.id,
          qrCodeUrl: `https://example.com/qrcode_${i}`,
          isRoundTrip: i % 2 === 0, // Alternate between round trip and one-way
          outboundTicketId: tickets[i * 2]?.id || null,
          returnTicketId: i % 2 === 0 ? tickets[i * 2 + 1]?.id || null : null, // Add return ticket for round trips
          detailPrice, // Attach detailPrice to the order
        },
      });

      // Create passengers associated with the order (excluding the infant)
      const passengers = [
        {
          orderId: order.id,
          seatId: outboundSeats[0].id, // Assign seat from outbound flight
          type: "Dewasa",
          title: "Mr",
          name: `John_${i}_1`,
          familyName: `Doe_${i}_1`,
          dateOfBirth: new Date("1990-01-01"),
          nationality: "US",
          identifierNumber: `123456789_${i}_1`,
          issuedCountry: "US",
          idValidUntil: new Date("2030-01-01"),
        },
        {
          orderId: order.id,
          seatId: outboundSeats[1].id, // Assign seat from outbound flight
          type: "Dewasa",
          title: "Ms",
          name: `Jane_${i}_1`,
          familyName: `Doe_${i}_1`,
          dateOfBirth: new Date("1992-02-02"),
          nationality: "US",
          identifierNumber: `987654321_${i}_1`,
          issuedCountry: "US",
          idValidUntil: new Date("2030-02-02"),
        },
        {
          orderId: order.id,
          seatId: returnSeats[0].id, // Assign seat from return flight (if applicable)
          type: "Anak",
          title: "Mr",
          name: `Child_${i}_1`,
          familyName: `Doe_${i}_1`,
          dateOfBirth: new Date("2015-06-15"),
          nationality: "US",
          identifierNumber: `567891234_${i}_1`,
          issuedCountry: "US",
          idValidUntil: new Date("2030-06-15"),
        },
      ];

      // Save passengers to the database (excluding the infant)
      await prisma.passenger.createMany({
        data: passengers,
      });

      orders.push(order);
    }

    console.log(`${orders.length} orders seeded successfully!`);
  } catch (error) {
    console.error("Error seeding orders:", error);
  }
}

async function main() {
  try {
    await seedAccounts();
    await seedNotifications();
    await seedDiscounts();
    await seedCities();
    await seedAirports();
    await seedRoutes();
    await seedTerminals();
    await seedAirlines();
    await seedAirplanes();
    await seedFlights();
    await seedTickets();
    await seedOrders();

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
