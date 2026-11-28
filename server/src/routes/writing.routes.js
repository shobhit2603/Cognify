import express from "express";
import * as writingController from "../controllers/writing.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  requireAuth,
  requireEmailVerification,
} from "../middlewares/auth.middleware.js";
import { aiEndpointLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
  generateEmailSchema,
  generateCoverLetterSchema,
  refineWritingSchema,
  updateWritingSchema,
  getWritingsQuerySchema,
} from "../validations/writing.validation.js";

const router = express.Router();

// All AI Writing routes require authentication and email verification
router.use(requireAuth);
router.use(requireEmailVerification);

/**
 * @swagger
 * tags:
 *   name: Writing
 *   description: AI Writing Studio (Email Writer & Cover Letter Generator) API
 */

/**
 * @swagger
 * /api/v1/writing/email:
 *   post:
 *     summary: Generate a tailored email with subject line via SSE stream
 *     tags: [Writing]
 *     security:
 *       - cookieAuth: []
 */
router.post(
  "/email",
  aiEndpointLimiter,
  validate(generateEmailSchema),
  writingController.generateEmail
);

/**
 * @swagger
 * /api/v1/writing/cover-letter:
 *   post:
 *     summary: Generate a tailored cover letter using Resume Studio or manual context via SSE stream
 *     tags: [Writing]
 *     security:
 *       - cookieAuth: []
 */
router.post(
  "/cover-letter",
  aiEndpointLimiter,
  validate(generateCoverLetterSchema),
  writingController.generateCoverLetter
);

/**
 * @swagger
 * /api/v1/writing:
 *   get:
 *     summary: List user's saved writing drafts with pagination, type filter, and search
 *     tags: [Writing]
 *     security:
 *       - cookieAuth: []
 */
router.get(
  "/",
  validate(getWritingsQuerySchema, "query"),
  writingController.getWritings
);

/**
 * @swagger
 * /api/v1/writing/{id}:
 *   get:
 *     summary: Get a single saved writing draft
 *     tags: [Writing]
 *     security:
 *       - cookieAuth: []
 */
router.get("/:id", writingController.getWritingById);

/**
 * @swagger
 * /api/v1/writing/{id}:
 *   patch:
 *     summary: Update draft title, subject, or editable content (auto-save)
 *     tags: [Writing]
 *     security:
 *       - cookieAuth: []
 */
router.patch(
  "/:id",
  validate(updateWritingSchema),
  writingController.updateWriting
);

/**
 * @swagger
 * /api/v1/writing/{id}/pin:
 *   patch:
 *     summary: Toggle pin status on a writing draft
 *     tags: [Writing]
 *     security:
 *       - cookieAuth: []
 */
router.patch("/:id/pin", writingController.togglePin);

/**
 * @swagger
 * /api/v1/writing/{id}/refine:
 *   post:
 *     summary: Refine an existing draft via preset or custom instruction (SSE stream)
 *     tags: [Writing]
 *     security:
 *       - cookieAuth: []
 */
router.post(
  "/:id/refine",
  aiEndpointLimiter,
  validate(refineWritingSchema),
  writingController.refineWriting
);

/**
 * @swagger
 * /api/v1/writing/{id}/restore:
 *   post:
 *     summary: Restore 1-level backed-up previous draft version
 *     tags: [Writing]
 *     security:
 *       - cookieAuth: []
 */
router.post("/:id/restore", writingController.restorePreviousVersion);

/**
 * @swagger
 * /api/v1/writing/{id}:
 *   delete:
 *     summary: Permanently delete a writing draft
 *     tags: [Writing]
 *     security:
 *       - cookieAuth: []
 */
router.delete("/:id", writingController.deleteWriting);

export default router;
