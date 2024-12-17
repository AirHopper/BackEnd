import "./instrument.mjs";
import express from "express";
import * as Sentry from "@sentry/node";
import path from "path";
import { createServer } from "http";
import dotenv from "dotenv";
import Routes from "./routes/index.routes.js";
import Middleware from "./middlewares/index.js";
import Views from "./views/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import listEndpoints from "express-list-endpoints";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger.json" with { type: "json" };

dotenv.config();

// Initialize express app
const app = express();
const server = createServer(app);

// Set the port
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use('/', express.static('public'));

// View Engine
app.set("views", path.join(path.resolve(), "/src/views"));
app.set("view engine", "ejs");

// Configure middlewares
Middleware(app);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// api docs swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// api docs swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Configure routes
Routes(app);

// Configure views
Views(app);

// Sentry error handler
Sentry.setupExpressErrorHandler(app);

// Error handling
app.use(errorHandler);

const start = async () => {
  try {
    if (process.env.NODE_ENV == "development") {
      console.log("================== API - LIST =======================");
      listEndpoints(app).forEach((route) => {
        route.methods.forEach((method) => {
          console.log(`Route => ${method} ${route.path}`);
        });
      });
      console.log("================== API - LIST =======================\n");
    }
    server.listen(PORT, () => {
      console.log(`🚀 [SERVER] is running on http://${process.env.APP_URL}`);
    });
  } catch (error) {
    console.log(`⚠️ [ERROR], ${error}`);
  }
};

start();
