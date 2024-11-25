import express from "express";
import tickets from "./ticket.js";

export default (app) => {
  const router = express.Router();

  router.use("/tickets", tickets);

  app.use("/api/v1", router);
};