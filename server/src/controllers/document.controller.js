import { StatusCodes } from "http-status-codes";
import * as documentService from "../services/document.service.js";
import * as documentRepository from "../repositories/document.repository.js";
import * as s3Storage from "../services/storage/s3.storage.js";
import ApiResponse from "../utils/apiResponse.util.js";
import path from "path";

export const handleLocalStorageUpload = async (req, res, next) => {
  try {
    const storageKey = req.query.key;
    if (!storageKey) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ApiResponse(StatusCodes.BAD_REQUEST, "Missing storage key parameter"));
    }

    // Reject path traversal components
    if (storageKey.includes("..") || path.isAbsolute(storageKey)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ApiResponse(StatusCodes.BAD_REQUEST, "Invalid storage key: path traversal detected"));
    }

    // Verify key belongs strictly to authenticated user's prefix
    const expectedPrefix = `documents/${req.user._id}/`;
    if (!storageKey.startsWith(expectedPrefix)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(ApiResponse(StatusCodes.FORBIDDEN, "Access denied: unauthorized storage key prefix"));
    }

    // Authorize specific storage object using a document record owned by authenticated user
    const doc = await documentRepository.findDocumentByStorageKey(storageKey);
    if (!doc || doc.userId.toString() !== req.user._id.toString()) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(ApiResponse(StatusCodes.FORBIDDEN, "Access denied: document ownership mismatch"));
    }

    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || "");
    if (!buffer || buffer.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ApiResponse(StatusCodes.BAD_REQUEST, "No file content received"));
    }

    await s3Storage.saveLocalBuffer(storageKey, buffer);

    if (!s3Storage.isLocalMode()) {
      try {
        await s3Storage.uploadBufferToS3(storageKey, buffer, "application/pdf");
      } catch (s3SyncErr) {
        console.warn("[Storage] S3 buffer sync notice (local copy available):", s3SyncErr.message);
      }
    }

    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "File stored successfully"));
  } catch (error) {
    next(error);
  }
};

export const handleLocalStorageDownload = async (req, res, next) => {
  try {
    const storageKey = req.query.key;
    if (!storageKey) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ApiResponse(StatusCodes.BAD_REQUEST, "Missing storage key parameter"));
    }

    // Reject path traversal components
    if (storageKey.includes("..") || path.isAbsolute(storageKey)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ApiResponse(StatusCodes.BAD_REQUEST, "Invalid storage key: path traversal detected"));
    }

    // Verify key belongs strictly to authenticated user's prefix
    const expectedPrefix = `documents/${req.user._id}/`;
    if (!storageKey.startsWith(expectedPrefix)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(ApiResponse(StatusCodes.FORBIDDEN, "Access denied: unauthorized storage key prefix"));
    }

    // Authorize specific storage object using a document record owned by authenticated user
    const doc = await documentRepository.findDocumentByStorageKey(storageKey);
    if (!doc || doc.userId.toString() !== req.user._id.toString()) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(ApiResponse(StatusCodes.FORBIDDEN, "Access denied: document ownership mismatch"));
    }

    const buffer = await s3Storage.getObjectBuffer(storageKey);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${path.basename(storageKey)}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const getUploadUrl = async (req, res, next) => {
  try {
    const { fileName, mimeType, size } = req.body;
    const data = await documentService.requestUploadUrl(req.user._id, {
      fileName,
      mimeType,
      size,
    });
    res.status(StatusCodes.CREATED).json(
      ApiResponse(StatusCodes.CREATED, "Upload URL generated successfully", data)
    );
  } catch (error) {
    next(error);
  }
};

export const processDocument = async (req, res, next) => {
  try {
    const data = await documentService.startProcessing(req.params.id, req.user._id);
    res.status(StatusCodes.OK).json(
      ApiResponse(StatusCodes.OK, "Document processing started", data)
    );
  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const data = await documentService.getDocuments(req.user._id, page, limit, search);
    res.status(StatusCodes.OK).json(
      ApiResponse(StatusCodes.OK, "Documents retrieved successfully", data)
    );
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const data = await documentService.getDocumentById(req.params.id, req.user._id);
    res.status(StatusCodes.OK).json(
      ApiResponse(StatusCodes.OK, "Document retrieved successfully", { document: data })
    );
  } catch (error) {
    next(error);
  }
};

export const askDocument = async (req, res, next) => {
  try {
    const { question } = req.body;
    const isStream = req.query.stream === "true" || req.headers.accept?.includes("text/event-stream");

    if (isStream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      try {
        const stream = documentService.streamAskDocument(req.params.id, req.user._id, question);
        for await (const chunk of stream) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();
      } catch (streamErr) {
        res.write(`data: ${JSON.stringify({ type: "error", error: streamErr.message })}\n\n`);
        res.end();
      }
      return;
    }

    const data = await documentService.askDocument(req.params.id, req.user._id, question);
    res.status(StatusCodes.OK).json(
      ApiResponse(StatusCodes.OK, "Question answered successfully", data)
    );
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const data = await documentService.deleteDocument(req.params.id, req.user._id);
    res.status(StatusCodes.OK).json(
      ApiResponse(StatusCodes.OK, "Document deleted successfully", data)
    );
  } catch (error) {
    next(error);
  }
};
