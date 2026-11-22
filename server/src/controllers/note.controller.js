import { StatusCodes } from "http-status-codes";
import * as noteService from "../services/note.service.js";
import ApiResponse from "../utils/apiResponse.util.js";

export const createNote = async (req, res, next) => {
  try {
    const note = await noteService.createNote(req.user._id, req.body);
    return res
      .status(StatusCodes.CREATED)
      .json(ApiResponse(StatusCodes.CREATED, "Note created successfully", note));
  } catch (error) {
    next(error);
  }
};

export const getNotes = async (req, res, next) => {
  try {
    const notes = await noteService.getNotes(req.user._id, req.query);
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Notes fetched successfully", notes));
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const note = await noteService.getNoteById(req.params.id, req.user._id);
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Note fetched successfully", note));
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const note = await noteService.updateNote(req.params.id, req.user._id, req.body);
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Note updated successfully", note));
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    await noteService.deleteNote(req.params.id, req.user._id);
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Note deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export const togglePin = async (req, res, next) => {
  try {
    const note = await noteService.togglePin(req.params.id, req.user._id);
    return res
      .status(StatusCodes.OK)
      .json(
        ApiResponse(
          StatusCodes.OK,
          note.isPinned ? "Note pinned to top" : "Note unpinned",
          note
        )
      );
  } catch (error) {
    next(error);
  }
};

export const moveNote = async (req, res, next) => {
  try {
    const note = await noteService.moveNote(
      req.params.id,
      req.user._id,
      req.body.folderId
    );
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Note moved successfully", note));
  } catch (error) {
    next(error);
  }
};

export const restorePreviousEnhancement = async (req, res, next) => {
  try {
    const note = await noteService.restorePreviousEnhancement(
      req.params.id,
      req.user._id
    );
    return res
      .status(StatusCodes.OK)
      .json(
        ApiResponse(StatusCodes.OK, "Previous enhancement restored", note)
      );
  } catch (error) {
    next(error);
  }
};
