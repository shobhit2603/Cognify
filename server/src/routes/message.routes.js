import express from "express";
import * as messageController from "../controllers/message.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth, requireEmailVerification } from "../middlewares/auth.middleware.js";
import {
  addMessageSchema,
  updateMessageSchema,
} from "../validations/message.validation.js";
import { aiEndpointLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

// All message routes require authentication and email verification
router.use(requireAuth);
router.use(requireEmailVerification);

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Chat Message management API
 */

/**
 * @swagger
 * /api/v1/messages/{chatId}:
 *   post:
 *     summary: Add a message to a chat
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - content
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, assistant, system]
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message added successfully
 */

/**
 * @swagger
 * /api/v1/messages/stream/{chatId}:
 *   post:
 *     summary: Add a message to a chat and stream response via SSE
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: false
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - content
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user]
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stream started
 */
router.post(
  "/stream/:chatId",
  aiEndpointLimiter,
  validate(addMessageSchema),
  messageController.streamMessage,
);

router.post(
  "/stream",
  aiEndpointLimiter,
  validate(addMessageSchema),
  messageController.streamMessage,
);

router.post(
  "/:chatId",
  aiEndpointLimiter,
  validate(addMessageSchema),
  messageController.addMessage,
);
/**
 * @swagger
 * /api/v1/messages:
 *   post:
 *     summary: Add a message to start a new chat
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - content
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, assistant, system]
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message added successfully and new chat created
 */
router.post("/", aiEndpointLimiter, validate(addMessageSchema), messageController.addMessage);

/**
 * @swagger
 * /api/v1/messages/{chatId}:
 *   get:
 *     summary: Get all messages for a specific chat
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
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
 *           default: 50
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 */
router.get("/:chatId", messageController.getMessages);

/**
 * @swagger
 * /api/v1/messages/{id}:
 *   patch:
 *     summary: Update a message
 *     tags: [Messages]
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
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message updated successfully
 */
router.patch(
  "/:id",
  validate(updateMessageSchema),
  messageController.updateMessage,
);

/**
 * @swagger
 * /api/v1/messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
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
 *         description: Message deleted successfully
 */
router.delete("/:id", messageController.deleteMessage);

export default router;
