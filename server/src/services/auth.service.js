import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import envConfig from "../config/env.config.js";
import * as userRepository from "../repositories/user.repository.js";
import * as sessionRepository from "../repositories/session.repository.js";
import ApiError from "../utils/apiError.util.js";
import { StatusCodes } from "http-status-codes";

/**
 * Register a new user and immediately create a session (auto-login on sign-up).
 */
export const registerAndLogin = async ({ name, email, password, userAgent, ipAddress }) => {
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw ApiError(StatusCodes.CONFLICT, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await userRepository.createUser({ name, email, password: hashedPassword });

  return createTokensAndSession(newUser, userAgent, ipAddress);
};

export const createTokensAndSession = async (user, userAgent, ipAddress) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    envConfig.JWT_SECRET,
    { expiresIn: envConfig.ACCESS_TOKEN_EXPIRY },
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    envConfig.REFRESH_TOKEN_SECRET,
    { expiresIn: envConfig.REFRESH_TOKEN_EXPIRY },
  );

  const expiresAt = new Date(
    Date.now() + envConfig.REFRESH_TOKEN_COOKIE_MAX_AGE,
  );

  await sessionRepository.createSession({
    userId: user._id,
    refreshToken,
    userAgent,
    ipAddress,
    expiresAt,
  });

  return { accessToken, refreshToken, user };
};

export const login = async (email, password, userAgent, ipAddress) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  return createTokensAndSession(user, userAgent, ipAddress);
};

export const refreshTokens = async (refreshToken, userAgent, ipAddress) => {
  const session =
    await sessionRepository.findSessionByRefreshToken(refreshToken);
  if (!session || session.isRevoked) {
    throw ApiError(
      StatusCodes.UNAUTHORIZED,
      "Invalid or revoked refresh token",
    );
  }

  if (new Date() > session.expiresAt) {
    await sessionRepository.revokeSession(refreshToken);
    throw ApiError(StatusCodes.UNAUTHORIZED, "Refresh token expired");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, envConfig.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
  }

  const user = await userRepository.findUserById(decoded.userId);
  if (!user) {
    throw ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  await sessionRepository.revokeSession(refreshToken);
  return createTokensAndSession(user, userAgent, ipAddress);
};

export const logout = async (refreshToken) => {
  if (refreshToken) {
    await sessionRepository.revokeSession(refreshToken);
  }
};

export const googleLogin = async (profile, userAgent, ipAddress) => {
  let user = await userRepository.findUserByGoogleId(profile.id);

  if (!user) {
    user = await userRepository.findUserByEmail(profile.emails[0].value);

    if (user) {
      user = await userRepository.updateUser(user._id, {
        googleId: profile.id,
        avatar: profile.photos[0].value,
      });
    } else {
      user = await userRepository.createUser({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        avatar: profile.photos[0].value,
        isEmailVerified: true,
      });
    }
  }

  return createTokensAndSession(user, userAgent, ipAddress);
};
