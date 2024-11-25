import { PrismaClient, RegionType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Seeding Airports
    await prisma.airport.createMany({
      data: [
        {
          iataCode: "JFK",
          name: "John F. Kennedy International Airport",
          city: "New York",
          cityCode: "NYC",
          country: "United States",
          countryCode: "US",
          latitude: 40.6413,
          longitude: -73.7781,
          type: RegionType.international,
        },
        {
          iataCode: "LAX",
          name: "Los Angeles International Airport",
          city: "Los Angeles",
          cityCode: "LAX",
          country: "United States",
          countryCode: "US",
          latitude: 33.9416,
          longitude: -118.4085,
          type: RegionType.international,
        },
        {
          iataCode: "SIN",
          name: "Singapore Changi Airport",
          city: "Singapore",
          cityCode: "SIN",
          country: "Singapore",
          countryCode: "SG",
          latitude: 1.3644,
          longitude: 103.9915,
          type: RegionType.international,
        },
        {
          iataCode: "CGK",
          name: "Soekarno-Hatta International Airport",
          city: "Jakarta",
          cityCode: "JKT",
          country: "Indonesia",
          countryCode: "ID",
          latitude: -6.1256,
          longitude: 106.6559,
          type: RegionType.international,
        },
        {
          iataCode: "DPS",
          name: "Ngurah Rai International Airport",
          city: "Bali",
          cityCode: "DPS",
          country: "Indonesia",
          countryCode: "ID",
          latitude: -8.7482,
          longitude: 115.1675,
          type: RegionType.international,
        },
      ],
    });

    // Seeding Terminals
    await prisma.terminal.createMany({
      data: [
        // JFK Terminals
        { name: "Terminal 1", type: "International", airportId: "JFK" },
        { name: "Terminal 2", type: "Domestic", airportId: "JFK" },
        { name: "Terminal 4", type: "International", airportId: "JFK" },
        { name: "Terminal 5", type: "Domestic", airportId: "JFK" },

        // LAX Terminals
        { name: "Terminal 1", type: "Domestic", airportId: "LAX" },
        { name: "Terminal 2", type: "International", airportId: "LAX" },
        {
          name: "Tom Bradley International Terminal",
          type: "International",
          airportId: "LAX",
        },

        // SIN Terminals
        { name: "Terminal 1", type: "International", airportId: "SIN" },
        { name: "Terminal 2", type: "International", airportId: "SIN" },
        { name: "Terminal 3", type: "International", airportId: "SIN" },
        { name: "Terminal 4", type: "International", airportId: "SIN" },

        // CGK Terminals
        { name: "Terminal 1", type: "Domestic", airportId: "CGK" },
        { name: "Terminal 2", type: "International", airportId: "CGK" },
        { name: "Terminal 3", type: "International", airportId: "CGK" },

        // DPS Terminals
        { name: "Terminal 1", type: "Domestic", airportId: "DPS" },
        { name: "Terminal 2", type: "International", airportId: "DPS" },
      ],
    });

    // Seeding Airlines
    await prisma.airline.createMany({
      data: [
        { iataCode: "AA", name: "American Airlines" },
        { iataCode: "SQ", name: "Singapore Airlines" },
        { iataCode: "DL", name: "Delta Airlines" },
        { iataCode: "GA", name: "Garuda Indonesia" },
        { iataCode: "QZ", name: "AirAsia Indonesia" },
      ],
    });

    // Seeding Airplanes (prices in Rupiah)
    await prisma.airplane.createMany({
      data: [
        {
          name: "Boeing 737",
          type: RegionType.domestic,
          pricePerKm: 2000.0, // Price per km in IDR
          airlineId: "AA",
        },
        {
          name: "Airbus A380",
          type: RegionType.international,
          pricePerKm: 3000.0, // Price per km in IDR
          airlineId: "SQ",
        },
        {
          name: "Boeing 787 Dreamliner",
          type: RegionType.international,
          pricePerKm: 2500.0, // Price per km in IDR
          airlineId: "DL",
        },
        {
          name: "Boeing 737 MAX",
          type: RegionType.domestic,
          pricePerKm: 1800.0, // Price per km in IDR
          airlineId: "GA",
        },
        {
          name: "Airbus A320",
          type: RegionType.domestic,
          pricePerKm: 1500.0, // Price per km in IDR
          airlineId: "QZ",
        },
      ],
    });

    // Seeding Account
    await prisma.account.createMany({
      data: [
        {
          email: "admin@example.com",
          password: hashedPassword,
          role: Role.admin,
          isVerified: true,
        },
        {
          email: "buyer@example.com",
          password: hashedPassword,
          role: Role.buyer,
          isVerified: true,
          user: {
            create: {
              username: "buyerUser",
              phoneNumber: "1234567890",
            },
          },
        },
      ],
    });

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
