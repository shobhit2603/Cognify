import { Note } from "../models/note.model.js";

export const create = async (noteData) => {
  return await Note.create(noteData);
};

export const findById = async (id) => {
  return await Note.findById(id);
};

export const findByIdAndUserId = async (id, userId) => {
  return await Note.findOne({ _id: id, userId });
};

export const findAllByUserId = async (userId, { search, folderId, isPinned } = {}) => {
  const query = { userId };

  if (typeof isPinned === "boolean") {
    query.isPinned = isPinned;
  }

  // Filter by folder if specified; if explicit null or 'null' string, query uncategorized notes
  if (folderId !== undefined) {
    if (folderId === null || folderId === "null" || folderId === "uncategorized") {
      query.folderId = null;
    } else {
      query.folderId = folderId;
    }
  }

  // Search filter (regex search across title and original content)
  if (search && search.trim()) {
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = new RegExp(escapedSearch, "i");
    query.$or = [{ title: searchRegex }, { originalContent: searchRegex }];
  }

  return await Note.find(query)
    .populate("folderId", "name color")
    .sort({ isPinned: -1, updatedAt: -1 });
};

export const countByFolderId = async (folderId, userId) => {
  return await Note.countDocuments({ folderId, userId });
};

export const update = async (id, userId, updateData) => {
  return await Note.findOneAndUpdate(
    { _id: id, userId },
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate("folderId", "name color");
};

export const remove = async (id, userId) => {
  return await Note.findOneAndDelete({ _id: id, userId });
};

export const unlinkFolder = async (folderId, userId) => {
  return await Note.updateMany(
    { folderId, userId },
    { $set: { folderId: null } }
  );
};
