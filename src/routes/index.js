import express from "express";
import tickets from "./ticket.js";
import routes from "./routeRoutes.js";
import payments from "./payment.js";

// Examples Import Route :
// import users from "./users.js";
// import posts from "./posts.js";
// import accounts from "./accounts.js";
// import auth from "./auth.js";
// import transactions from "./transactions.js";

export default (app) => {
  const router = express.Router();

  router.use("/tickets", tickets);
  router.use("/routes", routes);
  router.use("/payments", payments);

  // Examples Route Usage :
  //   router.use("/users", users);
  //   router.use("/posts", posts);
  //   router.use("/accounts", accounts);
  //   router.use("/transactions", transactions);
  //   router.use("/auth", auth);

  app.use("/api/v1", router);
};