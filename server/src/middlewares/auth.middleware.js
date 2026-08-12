import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import ApiResponse from "../utils/apiResponse.util.js";
import envConfig from "../config/env.config.js";
import { User } from "../models/user.model.js";

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(ApiResponse(StatusCodes.UNAUTHORIZED, "Authentication required"));
    }

    const decoded = jwt.verify(token, envConfig.JWT_SECRET || "default_jwt_secret");

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(ApiResponse(StatusCodes.UNAUTHORIZED, "Invalid authentication token"));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(ApiResponse(StatusCodes.UNAUTHORIZED, "Token expired"));
    }
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(ApiResponse(StatusCodes.UNAUTHORIZED, "Authentication failed"));
  }
};
