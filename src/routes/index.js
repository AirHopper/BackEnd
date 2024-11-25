import express from "express";
import routes from "./routeRoutes.js";

// Examples Import Route :
import auth from "./auth.js";
import flightRoutes from "./flight.routes.js";
// import users from "./users.js";
// import posts from "./posts.js";
// import accounts from "./accounts.js";
// import transactions from "./transactions.js";

export default (app) => {
  const router = express.Router();

  router.use("/routes", routes);

  // Examples Route Usage :
  router.use("/auth", auth);
  router.use("/flights", flightRoutes);
  //   router.use("/users", users);
  //   router.use("/posts", posts);
  //   router.use("/accounts", accounts);
  //   router.use("/transactions", transactions);

  app.use("/api/v1", router);
};
