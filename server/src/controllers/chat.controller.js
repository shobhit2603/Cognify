import { StatusCodes } from "http-status-codes";
import * as chatService from "../services/chat.service.js";
import ApiResponse from "../utils/apiResponse.util.js";
import { paginationSchema } from "../validations/pagination.validation.js";

export const createChat = async (req, res, next) => {
  try {
    const { title } = req.body;
    const userId = req.user._id;

    const chat = await chatService.createChat(userId, title);

    res
      .status(StatusCodes.CREATED)
      .json(ApiResponse(StatusCodes.CREATED, "Chat created successfully", { chat }));
  } catch (error) {
    next(error);
  }
};

export const getChats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page, limit, search } = paginationSchema.parse(req.query);

    const result = await chatService.getChats(userId, search, page, limit);

    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Chats retrieved successfully", result));
  } catch (error) {
    next(error);
  }
};

export const getChatById = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const userId = req.user._id;

    const chat = await chatService.getChatById(chatId, userId);

    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Chat retrieved successfully", { chat }));
  } catch (error) {
    next(error);
  }
};

export const updateChat = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const userId = req.user._id;
    const { title, pinned } = req.body;

    const updatedChat = await chatService.updateChat(chatId, userId, { title, pinned });

    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Chat updated successfully", { chat: updatedChat }));
  } catch (error) {
    next(error);
  }
};

export const deleteChat = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const userId = req.user._id;

    await chatService.deleteChat(chatId, userId);

    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Chat deleted successfully"));
  } catch (error) {
    next(error);
  }
};
