import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import envConfig from "../config/env.config.js";
import * as userRepository from "../repositories/user.repository.js";
import * as sessionRepository from "../repositories/session.repository.js";

export const register = async (userData) => {
  const existingUser = await userRepository.findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const newUser = await userRepository.createUser({
    ...userData,
    password: hashedPassword,
  });

  return newUser;
};

export const createTokensAndSession = async (user, userAgent, ipAddress) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    envConfig.JWT_SECRET || "default_jwt_secret",
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    envConfig.REFRESH_TOKEN_SECRET || "default_refresh_secret",
    { expiresIn: "7d" }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

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
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  return createTokensAndSession(user, userAgent, ipAddress);
};

export const refreshTokens = async (refreshToken, userAgent, ipAddress) => {
  const session = await sessionRepository.findSessionByRefreshToken(refreshToken);
  if (!session || session.isRevoked) {
    throw new Error("Invalid or revoked refresh token");
  }

  if (new Date() > session.expiresAt) {
    await sessionRepository.revokeSession(refreshToken);
    throw new Error("Refresh token expired");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, envConfig.REFRESH_TOKEN_SECRET || "default_refresh_secret");
  } catch (error) {
    throw new Error("Invalid refresh token");
  }

  const user = await userRepository.findUserById(decoded.userId);
  if (!user) {
    throw new Error("User not found");
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
      user = await userRepository.updateUser(user._id, { googleId: profile.id, avatar: profile.photos[0].value });
    } else {
      user = await userRepository.createUser({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        avatar: profile.photos[0].value,
        isEmailVerified: true
      });
    }
  }

  return createTokensAndSession(user, userAgent, ipAddress);
};
