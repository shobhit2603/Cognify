import express from "express";
import * as documentController from "../controllers/document.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth, requireEmailVerification } from "../middlewares/auth.middleware.js";
import {
  getUploadUrlSchema,
  askDocumentSchema,
} from "../validations/document.validation.js";
import { aiEndpointLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

// All document routes require authentication and email verification
router.use(requireAuth);
router.use(requireEmailVerification);

// Local storage fallback endpoints (when AWS S3 is not configured)
router.put(
  "/local-storage/upload",
  express.raw({ type: "*/*", limit: "50mb" }),
  documentController.handleLocalStorageUpload
);

router.get("/local-storage/file", documentController.handleLocalStorageDownload);

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document Analysis & PDF RAG API
 */

/**
 * @swagger
 * /api/v1/documents/upload-url:
 *   post:
 *     summary: Generate S3 presigned upload URL and document record
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/upload-url",
  validate(getUploadUrlSchema),
  documentController.getUploadUrl
);

/**
 * @swagger
 * /api/v1/documents:
 *   get:
 *     summary: Retrieve user's uploaded documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", documentController.getDocuments);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   get:
 *     summary: Retrieve a single document with summary and download URL
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", documentController.getDocumentById);

/**
 * @swagger
 * /api/v1/documents/{id}/process:
 *   post:
 *     summary: Trigger document parsing and vector indexing
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/process", documentController.processDocument);

/**
 * @swagger
 * /api/v1/documents/{id}/ask:
 *   post:
 *     summary: Ask a question against the document (contextual Q&A)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/:id/ask",
  aiEndpointLimiter,
  validate(askDocumentSchema),
  documentController.askDocument
);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   delete:
 *     summary: Delete a document and its vector chunks
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", documentController.deleteDocument);

export default router;
