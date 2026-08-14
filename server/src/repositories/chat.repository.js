import { Chat } from "../models/chat.model.js";

export const createChat = async (data) => {
  return Chat.create(data);
};

export const findChatsByUserId = async (
  userId,
  skip = 0,
  limit = 10,
) => {
  return Chat.find({ userId })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const countChatsByUserId = async (userId) => {
  return Chat.countDocuments({ userId });
};

export const findChatById = async (id) => {
  return Chat.findOne({ _id: id });
};

export const updateChat = async (id, updateData) => {
  return Chat.findByIdAndUpdate(id, updateData, {
    returnDocument: "after",
  }).lean();
};

export const softDeleteChat = async (id) => {
  return Chat.findByIdAndDelete(id).lean();
};
