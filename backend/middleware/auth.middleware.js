
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/env.js";

const authorize = async (req, res, next) => {
  console.log("Authorization middleware reached:", req.method, req.originalUrl);

  try {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      console.log("No access token received");

      return res.status(401).json({
        success: false,
        message: "No access token provided",
      });
    }


    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Checking JWT expiration...");
console.log("Token issued at:", new Date(decoded.iat * 1000));
console.log("Token expires at:", new Date(decoded.exp * 1000));
console.log("Current time:", new Date());

    console.log("Token is valid");

    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log("User not found");

      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authorization error:", error.name, error.message);

    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};


export const isAdmin = async (req, res, next) => {
  try {
    // works whichever way your verifyToken attaches the user
    const id = req.user?._id || req.user?.id || req.userId;
    if (!id) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(id).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Authorization failed" });
  }
};

export default authorize;