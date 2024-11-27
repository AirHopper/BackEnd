import express from "express";
import routes from "./route.routes.js";
import cities from "./city.routes.js";
import auth from "./auth.routes.js";
import flightRoutes from "./flight.routes.js";

export default (app) => {
  const router = express.Router();

  router.use("/auth", auth);
  router.use("/routes", routes);
  router.use("/cities", cities);
  router.use("/auth", auth);
  router.use("/flights", flightRoutes);

  app.use("/api/v1", router);
};
