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
 * Escape HTML special characters to prevent HTML injection
 */
const escapeHtml = (str) => {
  if (!str) return str;
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Register a new user and immediately create a session (auto-login on sign-up).
 */
export const registerAndLogin = async ({
  name,
  email,
  password,
  userAgent,
  ipAddress,
}) => {
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw ApiError(StatusCodes.CONFLICT, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await userRepository.createUser({
    name,
    email,
    password: hashedPassword,
  });

  // Send Welcome Email asynchronously
  sendEmail({
    to: newUser.email,
    subject: "Welcome to Cognify!",
    html: `
      <h2>Welcome ${escapeHtml(newUser.name)}!</h2>
      <p>We are thrilled to have you on board.</p>
      <p><strong>Cognify</strong> is your all-in-one AI powered learning and development platform. Here is a quick look at what you can do:</p>
      <ul>
        <li><strong>Personalized Roadmaps:</strong> Generate learning paths tailored to your specific goals.</li>
        <li><strong>Interactive Modules:</strong> Engage with dynamic content and hands-on exercises.</li>
        <li><strong>AI Chat Support:</strong> Get instant help, explanations, and guidance as you learn.</li>
        <li><strong>Progress Tracking:</strong> Monitor your growth and stay motivated on your journey.</li>
      </ul>
      <p>Get started today and explore all the features we have crafted for you.</p>
      <br />
      <p>Happy Learning!</p>
      <p>The Cognify Team</p>
    `,
  }).catch((err) => console.error("Failed to send welcome email:", err));

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

      // Send Welcome Email asynchronously
      sendEmail({
        to: user.email,
        subject: "Welcome to Cognify!",
        html: `
          <h2>Welcome ${escapeHtml(user.name)}!</h2>
          <p>We are thrilled to have you on board.</p>
          <p><strong>Cognify</strong> is your all-in-one AI powered learning and development platform. Here is a quick look at what you can do:</p>
          <ul>
            <li><strong>Personalized Roadmaps:</strong> Generate learning paths tailored to your specific goals.</li>
            <li><strong>Interactive Modules:</strong> Engage with dynamic content and hands-on exercises.</li>
            <li><strong>AI Chat Support:</strong> Get instant help, explanations, and guidance as you learn.</li>
            <li><strong>Progress Tracking:</strong> Monitor your growth and stay motivated on your journey.</li>
          </ul>
          <p>Get started today and explore all the features we have crafted for you.</p>
          <br />
          <p>Happy Learning!</p>
          <p>The Cognify Team</p>
        `,
      }).catch((err) => console.error("Failed to send welcome email:", err));
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
      <p>Hello ${escapeHtml(user.name)},</p>
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
