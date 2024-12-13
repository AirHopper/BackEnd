import customError from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

const authHandler = (req, res, next) => {
  // Get token
  const { authorization } = req.headers;
  const token = authorization && authorization.split(" ")[1];
  if (!token) {
    const error = new customError("Token not provided", 401);
    return next(error);
  }

  try {
    // Put id and email user on req.user
    req.user = verifyToken(token);
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    next(new customError("Invalid token", 403));
  }
};

export default authHandler;
