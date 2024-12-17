// import jwt from "jsonwebtoken";
// import AppError from "../utils/AppError.js";

export default (app) => {
  app.get("/", (req, res) => {
    res.render("home", {
      title: "Airhopper API",
      docs_url: `http://${process.env.APP_URL}/api/v1/api-docs`,
    });
  });
};
