/*
  Warnings:

  - A unique constraint covering the columns `[departure_airport_id,arrival_airport_id]` on the table `routes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "routes_departure_airport_id_arrival_airport_id_key" ON "routes"("departure_airport_id", "arrival_airport_id");
