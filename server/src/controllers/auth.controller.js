import { StatusCodes } from "http-status-codes";
import * as authService from "../services/auth.service.js";
import ApiResponse from "../utils/ApiResponse.js";

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearCookies = (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.register({ name, email, password });

    res
      .status(StatusCodes.CREATED)
      .json(ApiResponse(StatusCodes.CREATED, "User registered successfully", { user }));
  } catch (error) {
    if (error.message === "Email is already registered") {
      return res.status(StatusCodes.CONFLICT).json(ApiResponse(StatusCodes.CONFLICT, error.message));
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const { accessToken, refreshToken, user } = await authService.login(email, password, userAgent, ipAddress);

    setCookies(res, accessToken, refreshToken);

    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Login successful", { user }));
  } catch (error) {
    if (error.message === "Invalid email or password") {
      return res.status(StatusCodes.UNAUTHORIZED).json(ApiResponse(StatusCodes.UNAUTHORIZED, error.message));
    }
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    if (!refreshToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json(ApiResponse(StatusCodes.UNAUTHORIZED, "Refresh token required"));
    }

    const { accessToken, refreshToken: newRefreshToken, user } = await authService.refreshTokens(refreshToken, userAgent, ipAddress);

    setCookies(res, accessToken, newRefreshToken);

    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Tokens refreshed", { user }));
  } catch (error) {
    clearCookies(res);
    return res.status(StatusCodes.UNAUTHORIZED).json(ApiResponse(StatusCodes.UNAUTHORIZED, error.message));
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    await authService.logout(refreshToken);

    clearCookies(res);

    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Logout successful"));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "User profile", { user: req.user }));
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (req, res, next) => {
  try {
    const profile = req.user;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const { accessToken, refreshToken } = await authService.googleLogin(profile, userAgent, ipAddress);

    setCookies(res, accessToken, refreshToken);

    res.redirect(process.env.CLIENT_URL || "http://localhost:3000");
  } catch (error) {
    next(error);
  }
};
