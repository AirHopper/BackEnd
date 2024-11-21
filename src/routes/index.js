import express from "express";

// Examples Import Route
// import users from "./users.js";
// import posts from "./posts.js";
// import accounts from "./accounts.js";
// import auth from "./auth.js";
// import transactions from "./transactions.js";

export default (app) => {
  const router = express.Router();

  // Examples Route Usage :
  //   router.use("/users", users);
  //   router.use("/posts", posts);
  //   router.use("/accounts", accounts);
  //   router.use("/transactions", transactions);
  //   router.use("/auth", auth);

  app.use("/api/v1", router);
};
