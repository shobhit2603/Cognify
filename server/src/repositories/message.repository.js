import { Message } from "../models/message.model.js";

export const createMessage = async (data, session = null) => {
  return Message.create([data], { session }).then((docs) => docs[0]);
};

export const findMessagesByChatId = async (chatId, skip = 0, limit = 50) => {
  return Message.find({ chatId })
    .sort({ createdAt: 1 }) // Chronological order
    .skip(skip)
    .limit(limit)
    .lean();
};

export const countMessagesByChatId = async (chatId) => {
  return Message.countDocuments({ chatId });
};

export const findMessageById = async (id) => {
  return Message.findById(id);
};

export const updateMessage = async (id, updateData) => {
  return Message.findByIdAndUpdate(id, updateData, { returnDocument: "after" }).lean();
};

export const deleteMessage = async (id) => {
  return Message.findByIdAndDelete(id).lean();
};

export const deleteMessagesByChatId = async (chatId) => {
  return Message.deleteMany({ chatId }).lean();
};

export const deleteMessagesFromId = async (chatId, messageId, session = null) => {
  const options = session ? { session } : {};
  return Message.deleteMany({
    chatId,
    _id: { $gte: messageId }
  }, options).lean();
};
