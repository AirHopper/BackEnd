import jwt from 'jsonwebtoken';
const secretKey = process.env.JWT_SECRET;

const getToken = (id, email) => {
  const payload = {
    id: id,
    email: email,
  };
  const options = {
    expiresIn: "1h",
    issuer: "AirHopper",
  };
  return jwt.sign(payload, secretKey, options);
}

const verifyUser = (token) => {
  return jwt.verify(token, secretKey);
}

export { getToken, verifyUser }