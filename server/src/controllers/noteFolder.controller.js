import { StatusCodes } from "http-status-codes";
import * as noteFolderService from "../services/noteFolder.service.js";
import ApiResponse from "../utils/apiResponse.util.js";

export const createFolder = async (req, res, next) => {
  try {
    const folder = await noteFolderService.createFolder(req.user._id, req.body);
    return res
      .status(StatusCodes.CREATED)
      .json(ApiResponse(StatusCodes.CREATED, "Folder created successfully", folder));
  } catch (error) {
    next(error);
  }
};

export const getFolders = async (req, res, next) => {
  try {
    const folders = await noteFolderService.getFolders(req.user._id);
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Folders fetched successfully", folders));
  } catch (error) {
    next(error);
  }
};

export const getFolderById = async (req, res, next) => {
  try {
    const folder = await noteFolderService.getFolderById(req.params.id, req.user._id);
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Folder fetched successfully", folder));
  } catch (error) {
    next(error);
  }
};

export const updateFolder = async (req, res, next) => {
  try {
    const folder = await noteFolderService.updateFolder(
      req.params.id,
      req.user._id,
      req.body
    );
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Folder updated successfully", folder));
  } catch (error) {
    next(error);
  }
};

export const deleteFolder = async (req, res, next) => {
  try {
    await noteFolderService.deleteFolder(req.params.id, req.user._id);
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Folder deleted successfully"));
  } catch (error) {
    next(error);
  }
};
