import express from "express";
import * as noteController from "../controllers/note.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth, requireEmailVerification } from "../middlewares/auth.middleware.js";
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
 *   description: Notes Enhancer CRUD, Pinning, and Versioning API
 */

router.post("/", validate(createNoteSchema), noteController.createNote);
router.get("/", noteController.getNotes);
router.get("/:id", noteController.getNoteById);
router.patch("/:id", validate(updateNoteSchema), noteController.updateNote);
router.delete("/:id", noteController.deleteNote);

// Specific note actions
router.patch("/:id/pin", noteController.togglePin);
router.patch("/:id/move", validate(moveNoteSchema), noteController.moveNote);
router.post("/:id/restore", noteController.restorePreviousEnhancement);
router.post("/:id/enhance", validate(enhanceNoteSchema), noteController.enhanceNote);

export default router;
