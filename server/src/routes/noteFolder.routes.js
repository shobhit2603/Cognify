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

router.post("/", validate(createFolderSchema), noteFolderController.createFolder);
router.get("/", noteFolderController.getFolders);
router.get("/:id", noteFolderController.getFolderById);
router.patch("/:id", validate(updateFolderSchema), noteFolderController.updateFolder);
router.delete("/:id", noteFolderController.deleteFolder);

export default router;
