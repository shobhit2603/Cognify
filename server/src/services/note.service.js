import { StatusCodes } from "http-status-codes";
import * as noteRepository from "../repositories/note.repository.js";
import * as noteFolderRepository from "../repositories/noteFolder.repository.js";

// Helper to derive a clean title from the note's first non-empty line
const deriveTitleFromContent = (content) => {
  if (!content || !content.trim()) return "Untitled Note";
  const firstLine = content.trim().split("\n")[0].replace(/^[#*\s-]+/, "").trim();
  return firstLine.slice(0, 80) || "Untitled Note";
};

export const createNote = async (userId, data = {}) => {
  let folderId = null;

  // Validate folder ownership if folderId is provided
  if (data.folderId) {
    const folder = await noteFolderRepository.findById(data.folderId);
    if (!folder || folder.userId.toString() !== userId.toString()) {
      const error = new Error("Target folder not found");
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }
    folderId = folder._id;
  }

  const title = data.title && data.title.trim()
    ? data.title.trim()
    : deriveTitleFromContent(data.originalContent);

  return await noteRepository.create({
    userId,
    folderId,
    title,
    originalContent: data.originalContent || "",
    enhancedContent: data.enhancedContent || "",
  });
};

export const getNotes = async (userId, query = {}) => {
  const filters = {
    search: query.search,
    folderId: query.folderId,
    isPinned: query.isPinned !== undefined ? query.isPinned === "true" : undefined,
  };

  return await noteRepository.findAllByUserId(userId, filters);
};

export const getNoteById = async (id, userId) => {
  const note = await noteRepository.findByIdAndUserId(id, userId);
  if (!note) {
    const error = new Error("Note not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }
  return note;
};

export const updateNote = async (id, userId, updateData = {}) => {
  const note = await noteRepository.findByIdAndUserId(id, userId);
  if (!note) {
    const error = new Error("Note not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  const sanitizedUpdates = {};

  if (updateData.title !== undefined) {
    sanitizedUpdates.title = updateData.title.trim() || "Untitled Note";
  }

  if (updateData.originalContent !== undefined) {
    sanitizedUpdates.originalContent = updateData.originalContent;
    // Auto-update title if it's currently "Untitled Note"
    if ((!note.title || note.title === "Untitled Note") && !updateData.title) {
      sanitizedUpdates.title = deriveTitleFromContent(updateData.originalContent);
    }
  }

  if (updateData.enhancedContent !== undefined) {
    sanitizedUpdates.enhancedContent = updateData.enhancedContent;
  }

  if (updateData.isPinned !== undefined) {
    sanitizedUpdates.isPinned = updateData.isPinned;
  }

  if (updateData.folderId !== undefined) {
    if (updateData.folderId === null || updateData.folderId === "null") {
      sanitizedUpdates.folderId = null;
    } else {
      const folder = await noteFolderRepository.findById(updateData.folderId);
      if (!folder || folder.userId.toString() !== userId.toString()) {
        const error = new Error("Target folder not found");
        error.statusCode = StatusCodes.NOT_FOUND;
        throw error;
      }
      sanitizedUpdates.folderId = folder._id;
    }
  }

  return await noteRepository.update(id, userId, sanitizedUpdates);
};

export const deleteNote = async (id, userId) => {
  const note = await noteRepository.findByIdAndUserId(id, userId);
  if (!note) {
    const error = new Error("Note not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  return await noteRepository.remove(id, userId);
};

export const togglePin = async (id, userId) => {
  const note = await noteRepository.findByIdAndUserId(id, userId);
  if (!note) {
    const error = new Error("Note not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  return await noteRepository.update(id, userId, { isPinned: !note.isPinned });
};

export const moveNote = async (id, userId, folderId) => {
  const note = await noteRepository.findByIdAndUserId(id, userId);
  if (!note) {
    const error = new Error("Note not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  let targetFolderId = null;
  if (folderId !== null && folderId !== "null" && folderId !== undefined) {
    const folder = await noteFolderRepository.findById(folderId);
    if (!folder || folder.userId.toString() !== userId.toString()) {
      const error = new Error("Target folder not found");
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }
    targetFolderId = folder._id;
  }

  return await noteRepository.update(id, userId, { folderId: targetFolderId });
};

export const restorePreviousEnhancement = async (id, userId) => {
  const note = await noteRepository.findByIdAndUserId(id, userId);
  if (!note) {
    const error = new Error("Note not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  if (!note.previousEnhancedContent) {
    const error = new Error("No previous enhancement available to restore");
    error.statusCode = StatusCodes.BAD_REQUEST;
    throw error;
  }

  // Swap current and previous enhanced content conditionally on matching snapshot
  const restored = await noteRepository.update(
    id,
    userId,
    {
      enhancedContent: note.previousEnhancedContent,
      previousEnhancedContent: note.enhancedContent,
    },
    {
      enhancedContent: note.enhancedContent,
      previousEnhancedContent: note.previousEnhancedContent,
    }
  );

  if (!restored) {
    const error = new Error("Conflict: Note was modified concurrently");
    error.statusCode = StatusCodes.CONFLICT;
    throw error;
  }

  return restored;
};
