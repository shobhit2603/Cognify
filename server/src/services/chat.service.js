import * as chatRepository from "../repositories/chat.repository.js";
import ApiError from "../utils/apiError.util.js";

export const createChat = async (userId, title) => {
  // If no title is provided, use a default title.
  // TODO: Integrate with AI teammate's model to generate a dynamic title based on the first message.
  const initialTitle = title || "New Chat";

  const conversation = await chatRepository.createConversation({
    userId,
    title: initialTitle,
  });

  return conversation;
};

export const getChats = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [chats, total] = await Promise.all([
    chatRepository.findConversationsByUserId(userId, skip, limit),
    chatRepository.countConversationsByUserId(userId),
  ]);

  return {
    chats,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getChatById = async (chatId, userId) => {
  const chat = await chatRepository.findConversationById(chatId);

  if (!chat) {
    throw ApiError(404, "Chat not found");
  }

  // Ensure user owns the chat
  if (chat.userId.toString() !== userId.toString()) {
    throw ApiError(403, "Forbidden");
  }

  return chat;
};

export const updateChat = async (chatId, userId, updateData) => {
  // Verify ownership first
  await getChatById(chatId, userId);

  const updatedChat = await chatRepository.updateConversation(
    chatId,
    updateData,
  );
  return updatedChat;
};

export const deleteChat = async (chatId, userId) => {
  // Verify ownership first
  await getChatById(chatId, userId);

  await chatRepository.softDeleteConversation(chatId);
  return true;
};
