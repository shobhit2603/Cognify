import { User } from "../models/user.model.js";

export const createUser = async (userData) => {
  return User.create(userData);
};

export const findUserByEmail = async (email) => {
  return User.findOne({ email }).select("+password"); // Need password for verification
};

export const findUserById = async (id) => {
  return User.findById(id);
};

export const findUserByGoogleId = async (googleId) => {
  return User.findOne({ googleId });
};

export const updateUser = async (id, updateData) => {
  return User.findByIdAndUpdate(id, updateData, { new: true });
};
