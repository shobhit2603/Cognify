import { Session } from "../models/session.model.js";

export const createSession = async (sessionData) => {
  return Session.create(sessionData);
};

export const findSessionByRefreshToken = async (refreshToken) => {
  return Session.findOne({ refreshToken });
};

export const revokeSession = async (refreshToken) => {
  return Session.findOneAndUpdate(
    { refreshToken },
    { isRevoked: true },
    { new: true }
  );
};

export const revokeAllUserSessions = async (userId) => {
  return Session.updateMany({ userId }, { isRevoked: true });
};
