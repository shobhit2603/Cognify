import { StatusCodes } from "http-status-codes";
import * as messageService from "../services/message.service.js";
import ApiResponse from "../utils/apiResponse.util.js";

export const addMessage = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user._id;
    const { role, content } = req.body;

    const message = await messageService.addMessage(chatId, userId, role, content);

    // TODO: If role is 'user', here we might trigger the AI Service (implemented by teammate) 
    // to generate and append the assistant's response.

    res
      .status(StatusCodes.CREATED)
      .json(ApiResponse(StatusCodes.CREATED, "Message added successfully", { message }));
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

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
