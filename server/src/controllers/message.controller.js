import { StatusCodes } from "http-status-codes";
import * as messageService from "../services/message.service.js";
import * as chatService from "../services/chat.service.js";
import * as aiService from "../services/ai.service.js";
import ApiResponse from "../utils/apiResponse.util.js";
import { paginationSchema } from "../validations/pagination.validation.js";

// ─── Title generation deduplication ────────────────────────────────────────────
const generatingTitles = new Set();

/**
 * Generates a chat title asynchronously and persists it.
 * Deduplicated per chatId; no-ops after the first 6 messages or when the
 * title has already been customised.
 */
async function maybeGenerateTitle(chat, chatId, userId, content, messageCount) {
  if (
    (chat.title !== "New Chat" && chat.title !== "New Conversation") ||
    messageCount > 6
  ) return;

  if (generatingTitles.has(chatId)) return;
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

export const addMessage = async (req, res, next) => {
  try {
    let chatId = req.params.chatId;
    const userId = req.user._id;
    const { role, content, isTemporary, history: clientHistory = [] } = req.body;

    let chat = null;
    let message = null;

    if (!isTemporary) {
      // If no chatId is provided, create a new chat
      if (!chatId) {
        chat = await chatService.createChat(userId, "New Chat");
        chatId = chat._id.toString();
      }
      message = await messageService.addMessage(chatId, userId, role, content);
    } else {
      // Temporary chat: mock the message object
      message = { _id: `temp-${Date.now()}`, role, content, createdAt: new Date() };
    }

    let assistantMessage = null;

    if (role === "user") {
      let history;
      if (!isTemporary) {
        // Get history for AI
        const { messages } = await messageService.getMessages(chatId, userId, 1, 100);

        if (!chat) {
          chat = await chatService.getChatById(chatId, userId);
        }

        maybeGenerateTitle(chat, chatId, userId, content, messages.length);

        // Build history excluding the user's current message by its _id to
        // avoid relying on positional assumptions (slice(-1) is fragile when
        // page-1 returns fewer items than expected).
        const userMsgId = message._id.toString();
        history = messages
          .filter((m) => m._id.toString() !== userMsgId)
          .map((m) => ({
            role: m.role === "assistant" ? "ai" : m.role,
            content: m.content,
          }));
      } else {
        // Temporary chat: use client provided history
        history = clientHistory.map((m) => ({
          role: m.role === "assistant" ? "ai" : m.role,
          content: m.content,
        }));
      }

      // Generate AI Response
      let fullResponse = "";
      const events = aiService.getAIResponse({ content, history, chatId });
      for await (const chunk of events) {
        fullResponse += chunk.content;
      }

      // Save assistant message
      if (fullResponse) {
        if (!isTemporary) {
          assistantMessage = await messageService.addMessage(chatId, userId, "assistant", fullResponse);
        } else {
          assistantMessage = { _id: `temp-${Date.now()}`, role: "assistant", content: fullResponse, createdAt: new Date() };
        }
      }
    }

    res
      .status(StatusCodes.CREATED)
      .json(ApiResponse(StatusCodes.CREATED, "Message added successfully", {
        message,
        ...(assistantMessage && { assistantMessage }),
        ...(chat && { chat }),
      }));
  } catch (error) {
    next(error);
  }
};

export const streamMessage = async (req, res, next) => {
  let chatId = req.params.chatId;
  const userId = req.user._id;
  const { role, content, isTemporary, history: clientHistory = [] } = req.body;

  if (role !== "user") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(ApiResponse(StatusCodes.BAD_REQUEST, "Only user messages can initiate a stream"));
  }

  let chat = null;
  let userMessage = null;

  try {
    // ── 1. Perform all DB work BEFORE committing to SSE headers ──────────────
    //    If anything here throws we can still send a normal JSON error via next().
    if (!isTemporary) {
      if (!chatId) {
        chat = await chatService.createChat(userId, "New Chat");
        chatId = chat._id.toString();
      } else {
        chat = await chatService.getChatById(chatId, userId);
      }

      userMessage = await messageService.addMessage(chatId, userId, role, content);
    } else {
      userMessage = { _id: `temp-${Date.now()}`, role, content, createdAt: new Date() };
    }

    // ── 2. Now that setup succeeded, switch to SSE mode ──────────────────────
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // Send the initial "connected" frame immediately
    res.write(`data: ${JSON.stringify({ event: "connected", chat, message: userMessage })}\n\n`);

    // ── 3. Track whether the client disconnects mid-stream ───────────────────
    let clientDisconnected = false;
    req.on("close", () => {
      clientDisconnected = true;
    });

    let history;
    if (!isTemporary) {
      // Get history for AI
      const { messages } = await messageService.getMessages(chatId, userId, 1, 100);

      maybeGenerateTitle(chat, chatId, userId, content, messages.length);

      // Build history excluding the current user message by _id
      const userMsgId = userMessage._id.toString();
      history = messages
        .filter((m) => m._id.toString() !== userMsgId)
        .map((m) => ({
          role: m.role === "assistant" ? "ai" : m.role,
          content: m.content,
        }));
    } else {
      history = clientHistory.map((m) => ({
        role: m.role === "assistant" ? "ai" : m.role,
        content: m.content,
      }));
    }

    let fullResponse = "";

    // Generate AI Response and stream directly to client
    const events = aiService.getAIResponse({ content, history, chatId });

    for await (const chunk of events) {
      // Stop consuming events if the client has already disconnected
      if (clientDisconnected) break;

      if (chunk && chunk.content) {
        fullResponse += chunk.content;
        res.write(`data: ${JSON.stringify({ event: "chunk", content: chunk.content })}\n\n`);
        if (typeof res.flush === "function") res.flush();
      }
    }

    // Only persist and send "done" if the client is still connected
    if (!clientDisconnected) {
      let assistantMessage = null;
      if (fullResponse) {
        if (!isTemporary) {
          assistantMessage = await messageService.addMessage(chatId, userId, "assistant", fullResponse);
        } else {
          assistantMessage = { _id: `temp-ai-${Date.now()}`, role: "assistant", content: fullResponse, createdAt: new Date() };
        }
      }
      res.write(`data: ${JSON.stringify({ event: "done", message: assistantMessage })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error("[Stream Message Error]:", error);
    if (res.headersSent) {
      // SSE mode: send an error frame and close
      res.write(`data: ${JSON.stringify({ event: "error", error: "Failed to generate response." })}\n\n`);
      res.end();
    } else {
      // Headers not sent yet — delegate to the normal error handler
      next(error);
    }
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
