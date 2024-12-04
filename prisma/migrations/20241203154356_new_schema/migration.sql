-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Buyer');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('Issued', 'Unpaid', 'Cancelled', 'Expired');

-- CreateEnum
CREATE TYPE "ClassType" AS ENUM ('Economy', 'Premium_Economy', 'Business', 'First_Class');

-- CreateEnum
CREATE TYPE "PassengerType" AS ENUM ('Adult', 'Child', 'Baby');

-- CreateEnum
CREATE TYPE "TitleType" AS ENUM ('Mr', 'Ms');

-- CreateEnum
CREATE TYPE "RegionType" AS ENUM ('Domestic', 'International');

-- CreateEnum
CREATE TYPE "Continent" AS ENUM ('Africa', 'Antarctica', 'Asia', 'Europe', 'North_America', 'Oceania', 'South_America');

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'Buyer',
    "otp_code" TEXT,
    "otp_expiration" TIMESTAMP(3),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "continent" "Continent" NOT NULL,
    "imageUrl" TEXT,
    "imageId" TEXT,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "airports" (
    "iata_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "type" "RegionType" NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "airports_pkey" PRIMARY KEY ("iata_code")
);

-- CreateTable
CREATE TABLE "terminals" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RegionType" NOT NULL,
    "airport_id" TEXT NOT NULL,

    CONSTRAINT "terminals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airlines" (
    "iata_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageId" TEXT,

    CONSTRAINT "airlines_pkey" PRIMARY KEY ("iata_code")
);

-- CreateTable
CREATE TABLE "airplanes" (
    "id" SERIAL NOT NULL,
    "airline_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RegionType" NOT NULL,
    "price_per_km" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "airplanes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" SERIAL NOT NULL,
    "flight_id" INTEGER NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "is_occupied" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" SERIAL NOT NULL,
    "departure_airport_id" TEXT NOT NULL,
    "arrival_airport_id" TEXT NOT NULL,
    "distance" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "route_id" INTEGER NOT NULL,
    "isTransits" BOOLEAN NOT NULL DEFAULT false,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "arrival_date" TIMESTAMP(3) NOT NULL,
    "total_price" DECIMAL(65,30) NOT NULL,
    "total_duration" INTEGER NOT NULL,
    "discount_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flights" (
    "id" SERIAL NOT NULL,
    "route_id" INTEGER NOT NULL,
    "class" "ClassType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "airplane_id" INTEGER NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "arrival_time" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "baggage" INTEGER NOT NULL,
    "cabin_baggage" INTEGER NOT NULL,
    "entertainment" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "departure_terminal_id" INTEGER NOT NULL,
    "arrival_terminal_id" INTEGER NOT NULL,

    CONSTRAINT "flights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "qr_code_url" TEXT NOT NULL,
    "booking_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticket_status" "TicketStatus" NOT NULL DEFAULT 'Unpaid',
    "isRoundTrip" BOOLEAN NOT NULL DEFAULT false,
    "outbound_ticket_id" INTEGER NOT NULL,
    "return_ticket_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "payload" JSONB,
    "transaction_id" TEXT,
    "order_id" TEXT NOT NULL,
    "fraud_status" TEXT,
    "valid_until" TIMESTAMP(3),
    "payment_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passengers" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "seat_id" INTEGER NOT NULL,
    "type" "PassengerType" NOT NULL,
    "title" "TitleType" NOT NULL,
    "name" TEXT NOT NULL,
    "family_name" TEXT,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "nationality" TEXT NOT NULL,
    "identifier_number" TEXT NOT NULL,
    "issued_country" TEXT NOT NULL,
    "id_valid_until" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passengers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" SERIAL NOT NULL,
    "discount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FlightToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_account_id_key" ON "users"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_full_name_key" ON "users"("full_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "cities_code_key" ON "cities"("code");

-- CreateIndex
CREATE UNIQUE INDEX "airports_iata_code_key" ON "airports"("iata_code");

-- CreateIndex
CREATE UNIQUE INDEX "airlines_iata_code_key" ON "airlines"("iata_code");

-- CreateIndex
CREATE UNIQUE INDEX "airlines_name_key" ON "airlines"("name");

-- CreateIndex
CREATE UNIQUE INDEX "routes_departure_airport_id_arrival_airport_id_key" ON "routes"("departure_airport_id", "arrival_airport_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_payment_id_key" ON "orders"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_outbound_ticket_id_key" ON "orders"("outbound_ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_return_ticket_id_key" ON "orders"("return_ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_id_key" ON "payments"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "passengers_seat_id_key" ON "passengers"("seat_id");

-- CreateIndex
CREATE UNIQUE INDEX "_FlightToTicket_AB_unique" ON "_FlightToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_FlightToTicket_B_index" ON "_FlightToTicket"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airports" ADD CONSTRAINT "airports_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminals" ADD CONSTRAINT "terminals_airport_id_fkey" FOREIGN KEY ("airport_id") REFERENCES "airports"("iata_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airplanes" ADD CONSTRAINT "airplanes_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "airlines"("iata_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flights"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_departure_airport_id_fkey" FOREIGN KEY ("departure_airport_id") REFERENCES "airports"("iata_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_arrival_airport_id_fkey" FOREIGN KEY ("arrival_airport_id") REFERENCES "airports"("iata_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_airplane_id_fkey" FOREIGN KEY ("airplane_id") REFERENCES "airplanes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_departure_terminal_id_fkey" FOREIGN KEY ("departure_terminal_id") REFERENCES "terminals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_arrival_terminal_id_fkey" FOREIGN KEY ("arrival_terminal_id") REFERENCES "terminals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_outbound_ticket_id_fkey" FOREIGN KEY ("outbound_ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_return_ticket_id_fkey" FOREIGN KEY ("return_ticket_id") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FlightToTicket" ADD CONSTRAINT "_FlightToTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "flights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FlightToTicket" ADD CONSTRAINT "_FlightToTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
