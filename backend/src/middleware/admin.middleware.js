import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/user.js";

export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Admin access denied."
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired admin token."
      });
    }

    const userId = decoded.userId || decoded.sub;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload."
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.status === "banned") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended by an administrator."
      });
    }

    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Administrator privileges required."
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Admin authorization failed."
    });
  }
};
