import { Document } from "../models/document.model.js";
import { DocumentChunk } from "../models/documentChunk.model.js";

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildDocumentQuery(userId, search = "") {
  const query = { userId };
  if (search && search.trim()) {
    query.originalName = { $regex: escapeRegex(search.trim()), $options: "i" };
  }
  return query;
}

export const createDocument = async (data, session = null) => {
  const [document] = await Document.create([data], { session });
  return document;
};

export const findDocumentById = async (id) => {
  return Document.findById(id);
};

export const findDocumentsByUserId = async (userId, skip = 0, limit = 10, search = "") => {
  const query = buildDocumentQuery(userId, search);
  return Document.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const countDocumentsByUserId = async (userId, search = "") => {
  const query = buildDocumentQuery(userId, search);
  return Document.countDocuments(query);
};

export const updateDocument = async (id, updates, session = null) => {
  return Document.findByIdAndUpdate(id, updates, {
    returnDocument: "after",
    session,
  });
};

export const deleteDocument = async (id, session = null) => {
  return Document.findByIdAndDelete(id, { session });
};

export const createDocumentChunks = async (chunks, session = null) => {
  return DocumentChunk.insertMany(chunks, { session });
};

export const findChunksByDocumentId = async (documentId) => {
  return DocumentChunk.find({ documentId }).sort({ pageNumber: 1 }).lean();
};

export const deleteChunksByDocumentId = async (documentId, session = null) => {
  return DocumentChunk.deleteMany({ documentId }, { session });
};
