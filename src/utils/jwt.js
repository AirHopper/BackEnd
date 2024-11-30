import jwt from 'jsonwebtoken';
const secretKey = process.env.JWT_SECRET;
import customError from "../utils/AppError.js";

const getToken = (payloadData) => {
  const payload = payloadData;
  const options = {
    expiresIn: "1h",
    issuer: "AirHopper",
  };
  return jwt.sign(payload, secretKey, options);
}

const verifyToken = (token) => {
  try {
    const data = jwt.verify(token, secretKey);
    return data;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new customError('Token has expired', 401);
    } else {
      throw new customError('Authentication error', 400);
    }
  }
}

export { getToken, verifyToken }