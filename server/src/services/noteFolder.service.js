import { StatusCodes } from "http-status-codes";
import * as noteFolderRepository from "../repositories/noteFolder.repository.js";
import * as noteRepository from "../repositories/note.repository.js";

export const createFolder = async (userId, { name, color }) => {
  const trimmedName = name.trim();
  const existingFolder = await noteFolderRepository.findByNameAndUserId(userId, trimmedName);
  if (existingFolder) {
    const error = new Error("A folder with this name already exists");
    error.statusCode = StatusCodes.CONFLICT;
    throw error;
  }

  return await noteFolderRepository.create({
    userId,
    name: trimmedName,
    ...(color && { color }),
  });
};

export const getFolders = async (userId) => {
  const folders = await noteFolderRepository.findAllByUserId(userId);
  
  // Attach live note counts to each folder for UI badges
  const foldersWithCounts = await Promise.all(
    folders.map(async (folder) => {
      const noteCount = await noteRepository.countByFolderId(folder._id, userId);
      return {
        ...folder.toObject(),
        noteCount,
      };
    })
  );

  return foldersWithCounts;
};

export const getFolderById = async (id, userId) => {
  const folder = await noteFolderRepository.findById(id);
  if (!folder || folder.userId.toString() !== userId.toString()) {
    const error = new Error("Folder not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }
  const noteCount = await noteRepository.countByFolderId(id, userId);
  return {
    ...folder.toObject(),
    noteCount,
  };
};

export const updateFolder = async (id, userId, { name, color }) => {
  const folder = await noteFolderRepository.findById(id);
  if (!folder || folder.userId.toString() !== userId.toString()) {
    const error = new Error("Folder not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  const updateData = {};
  if (name !== undefined) {
    const trimmedName = name.trim();
    if (trimmedName.toLowerCase() !== folder.name.toLowerCase()) {
      const existingFolder = await noteFolderRepository.findByNameAndUserId(userId, trimmedName);
      if (existingFolder) {
        const error = new Error("A folder with this name already exists");
        error.statusCode = StatusCodes.CONFLICT;
        throw error;
      }
    }
    updateData.name = trimmedName;
  }

  if (color !== undefined) {
    updateData.color = color;
  }

  return await noteFolderRepository.update(id, userId, updateData);
};

export const deleteFolder = async (id, userId) => {
  const folder = await noteFolderRepository.findById(id);
  if (!folder || folder.userId.toString() !== userId.toString()) {
    const error = new Error("Folder not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  // STRICT RULE: Don't allow folder deletion if any note is still inside
  const noteCount = await noteRepository.countByFolderId(id, userId);
  if (noteCount > 0) {
    const error = new Error(
      `Cannot delete folder because it contains ${noteCount} note(s). Please move or delete the notes inside first.`
    );
    error.statusCode = StatusCodes.BAD_REQUEST;
    throw error;
  }

  return await noteFolderRepository.remove(id, userId);
};
