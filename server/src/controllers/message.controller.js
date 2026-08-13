import { StatusCodes } from "http-status-codes";
import * as messageService from "../services/message.service.js";
import * as chatService from "../services/chat.service.js";
import * as aiService from "../services/ai.service.js";
import ApiResponse from "../utils/apiResponse.util.js";
import { paginationSchema } from "../validations/pagination.validation.js";

export const addMessage = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user._id;
    const { role, content } = req.body;

    const message = await messageService.addMessage(chatId, userId, role, content);

    let assistantMessage = null;

    if (role === "user") {
      // Get history for AI and check if it's the first message
      const { messages } = await messageService.getMessages(chatId, userId, 1, 100);
      
      // Update Title if it's the first user message
      if (messages.length <= 2) { 
        const chat = await chatService.getChatById(chatId, userId);
        if (chat.title === "New Chat" || chat.title === "New Conversation") {
          const { chatTitle } = await aiService.getTitle({ message: content });
          if (chatTitle) {
            await chatService.updateChat(chatId, userId, { title: chatTitle });
          }
        }
      }

      // Format history for AI
      const history = messages.map(m => ({
        role: m.role === "assistant" ? "ai" : m.role,
        content: m.content
      }));

      // Generate AI Response
      let fullResponse = "";
      const events = aiService.getAIResponse({ content, history, chatId });
      for await (const chunk of events) {
        fullResponse += chunk.content;
      }

      // Save assistant message
      if (fullResponse) {
        assistantMessage = await messageService.addMessage(chatId, userId, "assistant", fullResponse);
      }
    }

    res
      .status(StatusCodes.CREATED)
      .json(ApiResponse(StatusCodes.CREATED, "Message added successfully", { 
        message, 
        ...(assistantMessage && { assistantMessage })
      }));
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user._id;
    const { page, limit } = paginationSchema.parse(req.query);

    const result = await messageService.getMessages(chatId, userId, page, limit);

    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Messages retrieved successfully", result));
  } catch (error) {
    next(error);
  }
};

export const updateMessage = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id;
    const { content } = req.body;

    const message = await messageService.updateMessage(messageId, userId, content);

    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Message updated successfully", { message }));
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id;

    await messageService.deleteMessage(messageId, userId);

    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Message deleted successfully"));
  } catch (error) {
    next(error);
  }
};
