import { Chat } from "../models/chat.model.js";

export const createConversation = async (data) => {
  return Chat.create(data);
};

export const findConversationsByUserId = async (
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

export const countConversationsByUserId = async (userId) => {
  return Chat.countDocuments({ userId });
};

export const findConversationById = async (id) => {
  return Chat.findOne({ _id: id });
};

export const updateConversation = async (id, updateData) => {
  return Chat.findByIdAndUpdate(id, updateData, {
    returnDocument: "after",
  }).lean();
};

export const softDeleteConversation = async (id) => {
  return Chat.findByIdAndDelete(id).lean();
};
