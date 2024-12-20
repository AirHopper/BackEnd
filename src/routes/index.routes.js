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
import orders from "./order.routes.js";
import { authHandler } from "../middlewares/authHandler.js";
import tickets from "./ticket.routes.js";
import users from "./user.routes.js";
import notifications from "./notification.routes.js";
import discounts from "./discount.routes.js";

export default (app) => {
  const router = express.Router();

  router.use("/routes", routes);
  router.use("/cities", cities);
  router.use("/airlines", airlines);
  router.use("/airplanes", airplanes);
  router.use("/airports", airports);
  router.use("/terminals", terminals);
  router.use("/auth", auth);
  router.use("/flights", flightRoutes);
  router.use("/orders", authHandler, orders);
  router.use("/payments", payments);
  router.use("/tickets", tickets);
  router.use("/users", users);
  router.use("/notifications", notifications);
  router.use("/discounts", discounts);

  app.use("/api/v1", router);
};
