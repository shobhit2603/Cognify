import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import envConfig from "../config/env.config.js";
import * as userRepository from "../repositories/user.repository.js";
import * as sessionRepository from "../repositories/session.repository.js";
import ApiError from "../utils/apiError.util.js";
import { StatusCodes } from "http-status-codes";
import { sendEmail } from "../utils/email.util.js";

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
    { userId: user._id, jti: randomUUID() },
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

export const forgotPassword = async (email) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    // For security, don't reveal that the user doesn't exist. Just return.
    return;
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash the OTP
  const hashedOtp = await bcrypt.hash(otp, 10);
  
  // Expiry time: 15 minutes from now
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await userRepository.updateUser(user._id, {
    resetPasswordOtp: hashedOtp,
    resetPasswordOtpExpires: expiresAt,
  });

  // Send Email
  await sendEmail({
    to: user.email,
    subject: "Cognify - Password Reset OTP",
    html: `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your password. Here is your 6-digit OTP:</p>
      <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
      <p>This OTP is valid for 15 minutes. If you did not request this, please ignore this email.</p>
    `,
  });
};

export const resetPassword = async (email, otp, newPassword) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw ApiError(StatusCodes.BAD_REQUEST, "Invalid email or OTP");
  }

  if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
    throw ApiError(StatusCodes.BAD_REQUEST, "Invalid email or OTP");
  }

  if (new Date() > user.resetPasswordOtpExpires) {
    throw ApiError(StatusCodes.BAD_REQUEST, "OTP has expired");
  }

  const isOtpValid = await bcrypt.compare(otp, user.resetPasswordOtp);
  if (!isOtpValid) {
    throw ApiError(StatusCodes.BAD_REQUEST, "Invalid email or OTP");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and clear OTP fields
  await userRepository.updateUser(user._id, {
    password: hashedPassword,
    resetPasswordOtp: null,
    resetPasswordOtpExpires: null,
  });
};
