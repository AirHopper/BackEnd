import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// await prisma.$connect();
// console.log("Database connected");

export default prisma;
