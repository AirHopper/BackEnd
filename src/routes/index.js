import express from "express";
import routes from "./routeRoutes.js";
import auth from "./authRoutes.js";

// Examples Import Route :

// import users from "./users.js";
// import posts from "./posts.js";
// import accounts from "./accounts.js";
// import transactions from "./transactions.js";

export default (app) => {
  const router = express.Router();

  router.use("/auth", auth);
  router.use("/routes", routes);

  // Examples Route Usage :
  //   router.use("/users", users);
  //   router.use("/posts", posts);
  //   router.use("/accounts", accounts);
  //   router.use("/transactions", transactions);

  app.use("/api/v1", router);
};
