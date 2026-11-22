import express from "express";
import * as noteController from "../controllers/note.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth, requireEmailVerification } from "../middlewares/auth.middleware.js";
import { aiEndpointLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
  createNoteSchema,
  updateNoteSchema,
  moveNoteSchema,
  enhanceNoteSchema,
} from "../validations/note.validation.js";

const router = express.Router();

// All note routes require authentication and email verification
router.use(requireAuth);
router.use(requireEmailVerification);

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Notes Enhancer CRUD, Pinning, Versioning, and AI Enhancement API
 */

/**
 * @swagger
 * /api/v1/notes:
 *   post:
 *     summary: Create a new raw note
 *     tags: [Notes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               originalContent:
 *                 type: string
 *               folderId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Note created successfully
 */
router.post("/", validate(createNoteSchema), noteController.createNote);

/**
 * @swagger
 * /api/v1/notes:
 *   get:
 *     summary: Fetch all notes for the current user (with search and folder filtering)
 *     tags: [Notes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for note title and content
 *       - in: query
 *         name: folderId
 *         schema:
 *           type: string
 *         description: Filter by folder ID or 'null' for uncategorized
 *       - in: query
 *         name: isPinned
 *         schema:
 *           type: boolean
 *         description: Filter pinned notes only
 *     responses:
 *       200:
 *         description: List of notes
 */
router.get("/", noteController.getNotes);

/**
 * @swagger
 * /api/v1/notes/{id}:
 *   get:
 *     summary: Get single note details
 *     tags: [Notes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note details
 */
router.get("/:id", noteController.getNoteById);

/**
 * @swagger
 * /api/v1/notes/{id}:
 *   patch:
 *     summary: Update note title, raw content, or enhanced content (auto-save)
 *     tags: [Notes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               originalContent:
 *                 type: string
 *               enhancedContent:
 *                 type: string
 *               folderId:
 *                 type: string
 *                 nullable: true
 *               isPinned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Note updated successfully
 */
router.patch("/:id", validate(updateNoteSchema), noteController.updateNote);

/**
 * @swagger
 * /api/v1/notes/{id}:
 *   delete:
 *     summary: Permanently delete a note
 *     tags: [Notes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note deleted successfully
 */
router.delete("/:id", noteController.deleteNote);

// Specific note actions

/**
 * @swagger
 * /api/v1/notes/{id}/pin:
 *   patch:
 *     summary: Toggle pin status of a note
 *     tags: [Notes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pin status toggled
 */
router.patch("/:id/pin", noteController.togglePin);

/**
 * @swagger
 * /api/v1/notes/{id}/move:
 *   patch:
 *     summary: Move note to a folder or uncategorized
 *     tags: [Notes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               folderId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Note moved successfully
 */
router.patch("/:id/move", validate(moveNoteSchema), noteController.moveNote);

/**
 * @swagger
 * /api/v1/notes/{id}/restore:
 *   post:
 *     summary: Restore previous enhanced content version
 *     tags: [Notes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Previous enhancement restored
 */
router.post("/:id/restore", noteController.restorePreviousEnhancement);

/**
 * @swagger
 * /api/v1/notes/{id}/enhance:
 *   post:
 *     summary: Stream AI note enhancement using 2-stage progress and SSE
 *     tags: [Notes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               frameworkId:
 *                 type: string
 *                 enum: [study-guide, code-tech, meeting-takeaways, quick-polish]
 *                 nullable: true
 *               customInstructions:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: "SSE event stream with events: stage, chunk, done, error"
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
router.post(
  "/:id/enhance",
  aiEndpointLimiter,
  validate(enhanceNoteSchema),
  noteController.enhanceNote
);

export default router;
