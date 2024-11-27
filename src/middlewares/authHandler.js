import customError from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

const authHandler = (req, res, next) => {
  // Get token
  const { authorization } = req.headers;
  const token = authorization && authorization.split(" ")[1];
  if (!token) {
    next(new customError("Token not provided"), 401);
  }

  try {
    // Put id and email user on req.user
    req.user = verifyToken(token);
    next();
  } catch (error) {
    next(new customError("Invalid token", 403));
  }
};

export default authHandler;
