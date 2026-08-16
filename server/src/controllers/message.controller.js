import { StatusCodes } from "http-status-codes";
import * as messageService from "../services/message.service.js";
import * as chatService from "../services/chat.service.js";
import * as aiService from "../services/ai.service.js";
import ApiResponse from "../utils/apiResponse.util.js";
import { paginationSchema } from "../validations/pagination.validation.js";

// Deduplication set for async title generation
const generatingTitles = new Set();

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
      // Deduplicate concurrent requests and limit retries to the first 6 messages
      if ((chat.title === "New Chat" || chat.title === "New Conversation") && messages.length <= 6) {
        if (!generatingTitles.has(chatId)) {
          generatingTitles.add(chatId);
          aiService.getTitle({ message: content })
            .then(async ({ chatTitle }) => {
              if (chatTitle && chatTitle !== "New Chat" && chatTitle !== "New Conversation") {
                await chatService.updateChat(chatId, userId, { title: chatTitle });
              }
            })
            .catch((err) => console.error("Error generating title:", err))
            .finally(() => generatingTitles.delete(chatId));
        }
      }

      // Format history for AI — exclude the last message (the user's current
      // turn) since it is already passed as `content`. Avoids duplicate context.
      const history = messages.slice(0, -1).map(m => ({
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

export const streamMessage = async (req, res, next) => {
  try {
    let chatId = req.params.chatId;
    const userId = req.user._id;
    const { role, content } = req.body;

    if (role !== "user") {
      return res.status(StatusCodes.BAD_REQUEST).json(ApiResponse(StatusCodes.BAD_REQUEST, "Only user messages can initiate a stream"));
    }

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // Ensure proxies don't buffer
    res.setHeader("X-Accel-Buffering", "no");

    let chat = null;

    // If no chatId is provided, create a new chat
    if (!chatId) {
      chat = await chatService.createChat(userId, "New Chat");
      chatId = chat._id.toString();
    } else {
      chat = await chatService.getChatById(chatId, userId);
    }

    // Save User Message
    const userMessage = await messageService.addMessage(chatId, userId, role, content);

    // Initial payload to client indicating stream has started
    res.write(`data: ${JSON.stringify({ event: "connected", chat, message: userMessage })}\n\n`);

    // Get history for AI
    const { messages } = await messageService.getMessages(chatId, userId, 1, 100);

    // Try to generate and update Title asynchronously if it's still default
    if ((chat.title === "New Chat" || chat.title === "New Conversation") && messages.length <= 6) {
      if (!generatingTitles.has(chatId)) {
        generatingTitles.add(chatId);
        aiService.getTitle({ message: content })
          .then(async ({ chatTitle }) => {
            if (chatTitle && chatTitle !== "New Chat" && chatTitle !== "New Conversation") {
              await chatService.updateChat(chatId, userId, { title: chatTitle });
            }
          })
          .catch((err) => console.error("Error generating title:", err))
          .finally(() => generatingTitles.delete(chatId));
      }
    }

    // Format history for AI — exclude the last message (the user's current
    // turn) since it is already passed as `content`. Avoids duplicate context.
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "ai" : m.role,
      content: m.content
    }));

    let fullResponse = "";
    
    // Generate AI Response and Stream directly to client
    const events = aiService.getAIResponse({ content, history, chatId });
    
    for await (const chunk of events) {
      if (chunk && chunk.content) {
        fullResponse += chunk.content;
        res.write(`data: ${JSON.stringify({ event: "chunk", content: chunk.content })}\n\n`);
        
        // Flush buffer — required when compression middleware is present.
        if (typeof res.flush === "function") {
          res.flush();
        }
      }
    }

    // Save assistant message to DB after stream completes
    let assistantMessage = null;
    if (fullResponse) {
      assistantMessage = await messageService.addMessage(chatId, userId, "assistant", fullResponse);
    }

    // Tell the client we are done
    res.write(`data: ${JSON.stringify({ event: "done", message: assistantMessage })}\n\n`);
    res.end();

  } catch (error) {
    console.error("[Stream Message Error]:", error);
    res.write(`data: ${JSON.stringify({ event: "error", error: "Failed to generate response." })}\n\n`);
    res.end();
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
