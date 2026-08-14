import { StatusCodes } from "http-status-codes";
import * as messageService from "../services/message.service.js";
import * as chatService from "../services/chat.service.js";
import * as aiService from "../services/ai.service.js";
import ApiResponse from "../utils/apiResponse.util.js";
import { paginationSchema } from "../validations/pagination.validation.js";

export const addMessage = async (req, res, next) => {
  try {
    let chatId = req.params.chatId;
    const userId = req.user._id;
    const { role, content } = req.body;

    let chat = null;

    // If no chatId is provided, create a new chat
    if (!chatId) {
      chat = await chatService.createChat(userId, "New Chat");
      chatId = chat._id.toString();
    }

    const message = await messageService.addMessage(chatId, userId, role, content);

    let assistantMessage = null;

    if (role === "user") {
      // Get history for AI
      const { messages } = await messageService.getMessages(chatId, userId, 1, 100);
      
      if (!chat) {
        chat = await chatService.getChatById(chatId, userId);
      }

      // Try to generate and update Title asynchronously if it's still default
      if (chat.title === "New Chat" || chat.title === "New Conversation") {
        aiService.getTitle({ message: content })
          .then(async ({ chatTitle }) => {
            if (chatTitle && chatTitle !== "New Chat" && chatTitle !== "New Conversation") {
              await chatService.updateChat(chatId, userId, { title: chatTitle });
            }
          })
          .catch((err) => console.error("Error generating title:", err));
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
        ...(assistantMessage && { assistantMessage }),
        ...(chat && { chat }) // Return chat object if a new one was created or fetched
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
