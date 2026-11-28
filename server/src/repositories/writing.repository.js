import { GeneratedContent } from "../models/generatedContent.model.js";

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildWritingQuery(userId, { type = "all", search = "" } = {}) {
  const query = { userId };

  if (type && type !== "all") {
    query.type = type;
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
    query.$or = [
      { title: searchRegex },
      { subject: searchRegex },
      { content: searchRegex },
    ];
  }

  return query;
}

export const create = async (draftData) => {
  return await GeneratedContent.create(draftData);
};

export const findByIdAndUserId = async (id, userId) => {
  return await GeneratedContent.findOne({ _id: id, userId });
};

export const findPaginatedByUserId = async (
  userId,
  { page = 1, limit = 20, type = "all", search = "" } = {}
) => {
  const query = buildWritingQuery(userId, { type, search });
  const skip = (Math.max(Number(page) || 1, 1) - 1) * limit;

  return await GeneratedContent.find(query)
    .select(
      "_id userId type title subject content previousContent previousSubject inputs metadata isPinned createdAt updatedAt"
    )
    .sort({ isPinned: -1, updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const countByUserId = async (
  userId,
  { type = "all", search = "" } = {}
) => {
  const query = buildWritingQuery(userId, { type, search });
  return await GeneratedContent.countDocuments(query);
};

export const update = async (id, userId, updateData, extraConditions = {}) => {
  return await GeneratedContent.findOneAndUpdate(
    { _id: id, userId, ...extraConditions },
    { $set: updateData },
    { returnDocument: "after", runValidators: true }
  );
};

export const remove = async (id, userId) => {
  return await GeneratedContent.findOneAndDelete({ _id: id, userId });
};

export const findRecentWritings = async (userId, limit = 8) => {
  return await GeneratedContent.find({ userId })
    .select("_id type title subject updatedAt createdAt")
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
};

export const countWritingsByUserId = async (userId) => {
  return await GeneratedContent.countDocuments({ userId });
};
