import express from "express";
import * as chatController from "../controllers/chat.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { createChatSchema, updateChatSchema } from "../validations/chat.validation.js";

const router = express.Router();

// All chat routes require authentication
router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Chat and Conversation management API
 */

/**
 * @swagger
 * /api/v1/chats:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chat created successfully
 */
router.post("/", validate(createChatSchema), chatController.createChat);

/**
 * @swagger
 * /api/v1/chats:
 *   get:
 *     summary: Get all chats for the current user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of chats per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional title to search for within the user's chats
 *     responses:
 *       200:
 *         description: Chats retrieved successfully
 */
router.get("/", chatController.getChats);

/**
 * @swagger
 * /api/v1/chats/{id}:
 *   get:
 *     summary: Get a specific chat by ID
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat retrieved successfully
 *       404:
 *         description: Chat not found
 */
router.get("/:id", chatController.getChatById);

/**
 * @swagger
 * /api/v1/chats/{id}:
 *   patch:
 *     summary: Update a chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
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
 *               pinned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Chat updated successfully
 */
router.patch("/:id", validate(updateChatSchema), chatController.updateChat);

/**
 * @swagger
 * /api/v1/chats/{id}:
 *   delete:
 *     summary: Delete a chat (soft delete)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat deleted successfully
 */
router.delete("/:id", chatController.deleteChat);

export default router;
