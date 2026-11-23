import { StatusCodes } from "http-status-codes";
import * as noteService from "../services/note.service.js";
import * as noteRepository from "../repositories/note.repository.js";
import {
  detectFramework,
  FRAMEWORK_MAP,
  streamNoteEnhancement,
  generateAndPersistTitleIfUntitled,
} from "../services/noteEnhancer.service.js";
import ApiResponse from "../utils/apiResponse.util.js";

export const createNote = async (req, res, next) => {
  try {
    const note = await noteService.createNote(req.user._id, req.body);
    return res
      .status(StatusCodes.CREATED)
      .json(ApiResponse(StatusCodes.CREATED, "Note created successfully", note));
  } catch (error) {
    next(error);
  }
};

export const getNotes = async (req, res, next) => {
  try {
    const notes = await noteService.getNotes(req.user._id, req.query);
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Notes fetched successfully", notes));
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const note = await noteService.getNoteById(req.params.id, req.user._id);
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Note fetched successfully", note));
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const note = await noteService.updateNote(req.params.id, req.user._id, req.body);
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Note updated successfully", note));
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    await noteService.deleteNote(req.params.id, req.user._id);
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Note deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export const togglePin = async (req, res, next) => {
  try {
    const note = await noteService.togglePin(req.params.id, req.user._id);
    return res
      .status(StatusCodes.OK)
      .json(
        ApiResponse(
          StatusCodes.OK,
          note.isPinned ? "Note pinned to top" : "Note unpinned",
          note
        )
      );
  } catch (error) {
    next(error);
  }
};

export const moveNote = async (req, res, next) => {
  try {
    const note = await noteService.moveNote(
      req.params.id,
      req.user._id,
      req.body.folderId
    );
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Note moved successfully", note));
  } catch (error) {
    next(error);
  }
};

export const restorePreviousEnhancement = async (req, res, next) => {
  try {
    const note = await noteService.restorePreviousEnhancement(
      req.params.id,
      req.user._id
    );
    return res
      .status(StatusCodes.OK)
      .json(
        ApiResponse(StatusCodes.OK, "Previous enhancement restored", note)
      );
  } catch (error) {
    next(error);
  }
};

/**
 * 2-Stage Progress + Real-time SSE Token Streaming Endpoint for Note Enhancement
 */
export const enhanceNote = async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const userId = req.user._id;
    const { frameworkId, customInstructions } = req.body || {};

    const note = await noteRepository.findByIdAndUserId(noteId, userId);
    if (!note) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ApiResponse(StatusCodes.NOT_FOUND, "Note not found"));
    }

    if (!note.originalContent || !note.originalContent.trim()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          ApiResponse(
            StatusCodes.BAD_REQUEST,
            "Note content is empty. Please add raw notes before enhancing."
          )
        );
    }

    // Resolve framework (specified or auto-detected)
    let framework = frameworkId ? FRAMEWORK_MAP[frameworkId] : null;
    if (!framework) {
      framework = detectFramework(note.originalContent);
    }

    // Setup SSE connection headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    let clientDisconnected = false;
    if (typeof req.on === "function") {
      req.on("close", () => {
        clientDisconnected = true;
      });
    }

    // Stage 1: Fast intent analysis event
    res.write(
      `data: ${JSON.stringify({
        event: "stage",
        stage: "detecting",
        message: "Analyzing note intent...",
      })}\n\n`
    );
    if (typeof res.flush === "function") res.flush();

    // Safely generate & persist title if note is untitled (handled in service layer)
    const generatedTitle = await generateAndPersistTitleIfUntitled({ note, userId });
    if (generatedTitle) {
      res.write(
        `data: ${JSON.stringify({
          event: "title",
          title: generatedTitle,
        })}\n\n`
      );
      if (typeof res.flush === "function") res.flush();
    }

    // Stage 2: Synthesis transition event
    res.write(
      `data: ${JSON.stringify({
        event: "stage",
        stage: "synthesizing",
        message: `Synthesizing blueprint (${framework.name})...`,
        framework: framework.name,
        frameworkId: framework.id,
      })}\n\n`
    );
    if (typeof res.flush === "function") res.flush();

    // Stream LLM tokens in real time
    let fullEnhancedContent = "";
    for await (const chunk of streamNoteEnhancement({
      rawContent: note.originalContent,
      frameworkId: framework.id,
      customInstructions,
    })) {
      if (clientDisconnected) break;
      if (chunk.content) {
        fullEnhancedContent += chunk.content;
        res.write(
          `data: ${JSON.stringify({ event: "chunk", content: chunk.content })}\n\n`
        );
        if (typeof res.flush === "function") res.flush();
      }
    }

    if (!clientDisconnected) {
      // Auto-save enhanced output + archive previous enhancement as version safeguard
      const updatedNote = await noteRepository.update(noteId, userId, {
        previousEnhancedContent: note.enhancedContent || null,
        enhancedContent: fullEnhancedContent,
        enhancedMetadata: {
          frameworkUsed: framework.name,
          enhancedAt: new Date(),
        },
      });

      res.write(
        `data: ${JSON.stringify({
          event: "done",
          note: updatedNote,
          frameworkUsed: framework.name,
          frameworkId: framework.id,
        })}\n\n`
      );
      res.end();
    }
  } catch (error) {
    console.error("[Note Enhancement Error]:", error);
    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({
          event: "error",
          error: "Failed to generate note enhancement.",
        })}\n\n`
      );
      res.end();
    } else {
      next(error);
    }
  }
};
