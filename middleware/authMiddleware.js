import jwt from "jsonwebtoken";
import response from "../utils/responseHandler.js";

const authMiddleware = (req, res, next) => {
  // Get token from Authorization header instead of cookies
  const authHeader = req.headers.authorization;

  const authToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

  if (!authToken) {
    return response(
      res,
      401,
      "Authentication Required. Please Provide a Token"
    );
  }

  try {
    const decode = jwt.verify(
      authToken,
      process.env.JWT_SECRET
    );

    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
    return response(
      res,
      401,
      "Invalid token or expired, please try again"
    );
  }
};

export default authMiddleware;