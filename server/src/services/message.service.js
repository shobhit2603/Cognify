import * as messageRepository from "../repositories/message.repository.js";
import * as chatService from "./chat.service.js";
import ApiError from "../utils/apiError.util.js";

export const addMessage = async (chatId, userId, role, content) => {
  // 1. Verify that the chat exists and belongs to the user
  await chatService.getChatById(chatId, userId);

  // 2. Create the message
  const message = await messageRepository.createMessage({
    chatId,
    role,
    content,
  });

  return message;
};

export const getMessages = async (chatId, userId, page = 1, limit = 50) => {
  // 1. Verify chat ownership
  await chatService.getChatById(chatId, userId);

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    messageRepository.findMessagesByChatId(chatId, skip, limit),
    messageRepository.countMessagesByChatId(chatId)
  ]);

  return {
    messages,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getMessageById = async (messageId, userId) => {
  const message = await messageRepository.findMessageById(messageId);
  if (!message) {
    throw ApiError(404, "Message not found");
  }
  // Verify that the user owns the chat this message belongs to
  await chatService.getChatById(message.chatId, userId);
  return message;
};

export const updateMessage = async (messageId, userId, content) => {
  const message = await messageRepository.findMessageById(messageId);
  if (!message) {
    throw ApiError(404, "Message not found");
  }

  // Verify that the user owns the chat this message belongs to
  await chatService.getChatById(message.chatId, userId);

  // Users can only edit their own messages
  if (message.role !== "user") {
    throw ApiError(403, "Cannot edit non-user messages");
  }

  return messageRepository.updateMessage(messageId, { content });
};

export const deleteMessage = async (messageId, userId) => {
  const message = await messageRepository.findMessageById(messageId);
  if (!message) {
    throw ApiError(404, "Message not found");
  }

  // Verify that the user owns the chat this message belongs to
  await chatService.getChatById(message.chatId, userId);

  return messageRepository.deleteMessage(messageId);
};

export const deleteMessagesAfterTimestamp = async (chatId, timestamp, userId) => {
  // Verify that the user owns the chat
  await chatService.getChatById(chatId, userId);

  return messageRepository.deleteMessagesAfterTimestamp(chatId, timestamp);
};

