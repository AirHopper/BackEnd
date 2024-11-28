import express from "express";
import routes from "./route.routes.js";
import cities from "./city.routes.js";
import airlines from "./airline.routes.js";
import airplanes from "./airplane.routes.js";
import airports from "./airport.routes.js";
import terminals from "./terminal.routes.js";
import auth from "./auth.routes.js";
import flightRoutes from "./flight.routes.js";
import payments from "./payment.routes.js";
import tickets from "./ticket.js";

export default (app) => {
  const router = express.Router();

  router.use("/auth", auth);
  router.use("/routes", routes);
  router.use("/cities", cities);
  router.use("/airlines", airlines);
  router.use("/airplanes", airplanes);
  router.use("/airports", airports);
  router.use("/terminals", terminals);
  router.use("/auth", auth);
  router.use("/flights", flightRoutes);
  router.use("/tickets", tickets);
  router.use("/payments", payments);

  app.use("/api/v1", router);
};
