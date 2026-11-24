import express from "express";
import * as resumeController from "../controllers/resume.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth, requireEmailVerification } from "../middlewares/auth.middleware.js";
import {
  updateResumeTitleSchema,
  getResumesQuerySchema,
  resumeAuditSchema,
  resumeChatSchema,
} from "../validations/resume.validation.js";
import { aiEndpointLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

// All resume routes require authentication and email verification
router.use(requireAuth);
router.use(requireEmailVerification);

/**
 * @swagger
 * tags:
 *   name: Resumes
 *   description: Resume Studio & ATS Optimization API
 */

/**
 * @swagger
 * /api/v1/resumes/upload:
 *   post:
 *     summary: Synchronously upload PDF resume and extract text in-memory
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/upload",
  express.raw({ type: "*/*", limit: "15mb" }),
  resumeController.uploadResume
);

/**
 * @swagger
 * /api/v1/resumes:
 *   get:
 *     summary: Retrieve user's uploaded resumes with search and pagination
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/",
  validate(getResumesQuerySchema, "query"),
  resumeController.getResumes
);

/**
 * @swagger
 * /api/v1/resumes/{id}:
 *   get:
 *     summary: Retrieve a single resume with full parsed sections and audit
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", resumeController.getResumeById);

/**
 * @swagger
 * /api/v1/resumes/{id}/file:
 *   get:
 *     summary: Serve original PDF securely inline for Right Preview Panel
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id/file", resumeController.getResumeFile);

/**
 * @swagger
 * /api/v1/resumes/{id}:
 *   patch:
 *     summary: Rename resume title
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id",
  validate(updateResumeTitleSchema, "body"),
  resumeController.updateResumeTitle
);

/**
 * @swagger
 * /api/v1/resumes/{id}:
 *   delete:
 *     summary: Delete a resume and its storage file
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", resumeController.deleteResume);

/**
 * @swagger
 * /api/v1/resumes/{id}/audit:
 *   post:
 *     summary: Run full 4-dimensional ATS diagnostic audit
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/:id/audit",
  aiEndpointLimiter,
  validate(resumeAuditSchema, "body"),
  resumeController.auditResume
);

/**
 * @swagger
 * /api/v1/resumes/{id}/chat:
 *   post:
 *     summary: Interactive resume chat & section optimization (SSE stream)
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/:id/chat",
  aiEndpointLimiter,
  validate(resumeChatSchema, "body"),
  resumeController.chatResume
);

export default router;
