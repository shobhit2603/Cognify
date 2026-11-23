import { NoteFolder } from "../models/noteFolder.model.js";

export const create = async (folderData) => {
  return await NoteFolder.create(folderData);
};

export const findById = async (id) => {
  return await NoteFolder.findById(id);
};

export const findAllByUserId = async (userId) => {
  return await NoteFolder.find({ userId }).sort({ name: 1 });
};

export const findByNameAndUserId = async (userId, name) => {
  const trimmed = name.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return await NoteFolder.findOne({
    userId,
    name: { $regex: new RegExp(`^${escaped}$`, "i") },
  });
};

export const update = async (id, userId, updateData) => {
  return await NoteFolder.findOneAndUpdate(
    { _id: id, userId },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

export const remove = async (id, userId) => {
  return await NoteFolder.findOneAndDelete({ _id: id, userId });
};
