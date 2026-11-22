import express from "express";
import * as noteFolderController from "../controllers/noteFolder.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth, requireEmailVerification } from "../middlewares/auth.middleware.js";
import {
  createFolderSchema,
  updateFolderSchema,
} from "../validations/note.validation.js";

const router = express.Router();

// All folder routes require authentication and email verification
router.use(requireAuth);
router.use(requireEmailVerification);

/**
 * @swagger
 * tags:
 *   name: Note Folders
 *   description: Organization and folder management for Notes Enhancer
 */

/**
 * @swagger
 * /api/v1/note-folders:
 *   post:
 *     summary: Create a new note folder
 *     tags: [Note Folders]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Folder created
 */
router.post("/", validate(createFolderSchema), noteFolderController.createFolder);

/**
 * @swagger
 * /api/v1/note-folders:
 *   get:
 *     summary: Get all folders for user with note counts
 *     tags: [Note Folders]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of folders with noteCount
 */
router.get("/", noteFolderController.getFolders);

/**
 * @swagger
 * /api/v1/note-folders/{id}:
 *   get:
 *     summary: Get single folder by ID
 *     tags: [Note Folders]
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
 *         description: Folder details
 */
router.get("/:id", noteFolderController.getFolderById);

/**
 * @swagger
 * /api/v1/note-folders/{id}:
 *   patch:
 *     summary: Rename or update folder color
 *     tags: [Note Folders]
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
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Folder updated
 */
router.patch("/:id", validate(updateFolderSchema), noteFolderController.updateFolder);

/**
 * @swagger
 * /api/v1/note-folders/{id}:
 *   delete:
 *     summary: Delete empty folder (blocked if folder contains notes)
 *     tags: [Note Folders]
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
 *         description: Folder deleted
 *       400:
 *         description: Cannot delete folder while it contains notes
 */
router.delete("/:id", noteFolderController.deleteFolder);

export default router;
