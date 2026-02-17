import jwt from "jsonwebtoken";

export const authChecker = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Format: "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token please provide a token" });
    }

    // Token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded)
    req.user = decoded.userID; // decoded user ko request me store kar diya
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
