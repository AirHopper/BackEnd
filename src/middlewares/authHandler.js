import customError from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

// Middleware to authenticate user
const authHandler = (req, res, next) => {
  // Get token from headers
  const { authorization } = req.headers;
  const token = authorization && authorization.split(" ")[1];
  if (!token) {
    const error = new customError("Token not provided", 401);
    return next(error);
  }

  try {
    // Decode and verify the token, and attach user info to req.user
    req.user = verifyToken(token);
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    next(new customError("Invalid token", 403));
  }
};

// Middleware to check admin role
const adminHandler = (req, res, next) => {
  // Ensure user info exists on the request object
  if (!req.user || req.user.role !== "Admin") {
    return next(new customError("Access denied: Admins only", 403));
  }
  next();
};

export { authHandler, adminHandler };
