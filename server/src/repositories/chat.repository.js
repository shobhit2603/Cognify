import { Chat } from "../models/chat.model.js";

export const createChat = async (data) => {
  return Chat.create(data);
};

export const findChatsByUserId = async (userId, title = "", skip = 0, limit = 10) => {
  const query = { userId, isDeleted: { $ne: true } };
  if (title) {
    query.title = { $regex: title, $options: "i" };
  }

  return Chat.find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const countChatsByUserId = async (userId, title = "") => {
  const query = { userId, isDeleted: { $ne: true } };
  if (title) {
    query.title = { $regex: title, $options: "i" };
  }
  return Chat.countDocuments(query);
};

export const findChatById = async (id) => {
  return Chat.findOne({ _id: id, isDeleted: { $ne: true } });
};

export const updateChat = async (id, updateData) => {
  return Chat.findByIdAndUpdate(id, updateData, {
    returnDocument: "after",
  }).lean();
};

export const softDeleteChat = async (id) => {
  return Chat.findByIdAndUpdate(id, { isDeleted: true }).lean();
};
