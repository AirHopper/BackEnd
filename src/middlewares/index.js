import cors from "cors";
import morgan from "morgan";
import express from "express";

export default (app) => {
  // Trust proxy headers for reverse proxy handling (e.g., Nginx)
  app.set("trust proxy", true);

  // Logging
  if (process.env.NODE_ENV === "production") {
    app.use(morgan("combined"));
  } else {
    app.use(morgan("dev"));
  }

  // JSON Parsing
  app.use(express.json());

  // Enable CORS
  const corsOptions = {
    origin: "*", // Allow all origins; restrict in production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
  app.use(cors(corsOptions));
};
