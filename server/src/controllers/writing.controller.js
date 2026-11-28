import { StatusCodes } from "http-status-codes";
import ApiResponse from "../utils/apiResponse.util.js";
import ApiError from "../utils/apiError.util.js";
import * as writingService from "../services/writing.service.js";
import * as writingAI from "../services/writingAI.service.js";

function writeSse(res, payload) {
  if (!res.writableFinished) {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    if (typeof res.flush === "function") res.flush();
  }
}

/**
 * Shared SSE execution pipeline for Email generation, Cover Letter generation, and Refinement.
 */
async function executeWritingStream({
  res,
  next,
  userId,
  type,
  draftId = null,
  titleOverride = null,
  inputs = {},
  messages,
  initialSubject = "",
  stageLabel = "Generating draft...",
  refineAction = null,
}) {
  const abortController = new AbortController();
  let clientDisconnected = false;
  let modelName = "groq";
  let provider = "groq";
  let subject = initialSubject || "";
  let accumulatedBody = "";

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    if (typeof res.on === "function") {
      res.on("close", () => {
        if (!res.writableFinished) {
          clientDisconnected = true;
          abortController.abort();
        }
      });
    }

    writeSse(res, {
      event: "stage",
      stage: "generating",
      message: stageLabel,
    });

    try {
      for await (const item of writingAI.streamWritingGeneration({
        messages,
        type,
        signal: abortController.signal,
      })) {
        if (clientDisconnected) break;

        if (item.event === "meta") {
          modelName = item.model || modelName;
          provider = item.provider || provider;
        } else if (item.event === "subject") {
          subject = item.subject || subject;
          writeSse(res, { event: "subject", subject });
        } else if (item.event === "chunk" && item.content) {
          accumulatedBody += item.content;
          writeSse(res, { event: "chunk", content: item.content });
        }
      }
    } catch (streamError) {
      if (!(abortController.signal.aborted && clientDisconnected)) {
        throw streamError;
      }
    }

    const trimmedBody = accumulatedBody.trim();
    const hasUsableContent = trimmedBody.length > 0;

    // Persist completed output OR non-empty partial output when user stops mid-stream
    if (hasUsableContent) {
      const explicitTitle = titleOverride?.trim() || null;
      const resolveTitle = async () => {
        if (clientDisconnected) {
          return (
            type === "cover-letter"
              ? [inputs.targetRole, inputs.targetCompany]
                  .filter(Boolean)
                  .join(" - ") || "Partial Cover Letter"
              : subject || inputs.purpose || "Partial Email Draft"
          ).slice(0, 100);
        }
        return await writingAI.generateDraftTitle({
          type,
          inputs,
          subject,
          previewText: trimmedBody,
        });
      };

      const savedDraft = await writingService.saveGeneratedDraft({
        userId,
        draftId,
        type,
        title: explicitTitle,
        resolveTitle,
        subject: type === "email" ? subject : "",
        inputs,
        content: trimmedBody,
        metadata: {
          model: modelName,
          provider,
          lastRefinedAction: refineAction,
          isPartial: clientDisconnected,
        },
      });

      await writingAI.recordWritingUsage({
        userId,
        model: modelName,
        status: "success",
      });

      if (!clientDisconnected && !res.writableFinished) {
        writeSse(res, { event: "title", title: savedDraft.title });
        writeSse(res, { event: "done", draft: savedDraft });
        res.end();
      }
      return;
    }

    if (!clientDisconnected && !res.writableFinished) {
      await writingAI.recordWritingUsage({
        userId,
        model: modelName,
        status: "failed",
      });
      writeSse(res, {
        event: "error",
        error: "AI did not return any content. Please try again.",
      });
      res.end();
    }
  } catch (error) {
    console.error("[AI Writing Stream Error]:", error);
    await writingAI.recordWritingUsage({
      userId,
      model: modelName,
      status: "failed",
    });

    if (clientDisconnected || res.writableFinished) {
      return;
    }

    if (res.headersSent) {
      writeSse(res, {
        event: "error",
        error: "Failed to generate writing draft. Please try again.",
      });
      res.end();
    } else {
      next(error);
    }
  }
}

export const generateEmail = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      purpose,
      intent,
      context,
      replyToEmail,
      recipientContext,
      tone,
      formality,
      length,
      title,
      draftId,
    } = req.body;

    if (draftId) {
      const existing = await writingService.getWritingById(draftId, userId);
      if (existing.type !== "email") {
        throw ApiError(
          StatusCodes.BAD_REQUEST,
          "Draft type mismatch for email regeneration"
        );
      }
    }

    const messages = writingAI.buildEmailPrompt({
      purpose,
      intent,
      context,
      replyToEmail,
      recipientContext,
      tone,
      formality,
      length,
    });

    await executeWritingStream({
      res,
      next,
      userId,
      type: "email",
      draftId,
      titleOverride: title,
      inputs: {
        purpose,
        intent,
        context,
        replyToEmail,
        recipientContext,
        tone,
        formality,
        length,
      },
      messages,
      stageLabel: "Drafting subject & email copy...",
    });
  } catch (error) {
    next(error);
  }
};

export const generateCoverLetter = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      jobDescription,
      resumeId,
      userBackground,
      targetCompany,
      targetRole,
      tone,
      length,
      title,
      draftId,
    } = req.body;

    if (draftId) {
      const existing = await writingService.getWritingById(draftId, userId);
      if (existing.type !== "cover-letter") {
        throw ApiError(
          StatusCodes.BAD_REQUEST,
          "Draft type mismatch for cover letter regeneration"
        );
      }
    }

    // Strict server-side ownership validation for attached Resume Studio document
    const resolvedContext = await writingService.resolveCoverLetterContext(
      userId,
      { resumeId, userBackground }
    );

    const messages = writingAI.buildCoverLetterPrompt({
      resumeContext: resolvedContext.resumeContext,
      userBackground: resolvedContext.userBackground,
      jobDescription,
      targetCompany,
      targetRole,
      tone,
      length,
    });

    await executeWritingStream({
      res,
      next,
      userId,
      type: "cover-letter",
      draftId,
      titleOverride: title,
      inputs: {
        resumeId: resolvedContext.resumeId,
        resumeTitle: resolvedContext.resumeTitle,
        userBackground: resolvedContext.userBackground,
        jobDescription,
        targetCompany,
        targetRole,
        tone,
        length,
      },
      messages,
      stageLabel: resolvedContext.resumeId
        ? `Tailoring cover letter from "${resolvedContext.resumeTitle}"...`
        : "Crafting tailored cover letter...",
    });
  } catch (error) {
    next(error);
  }
};

export const refineWriting = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { action, customInstruction } = req.body;
    const existing = await writingService.getWritingById(req.params.id, userId);

    if (!existing.content || !existing.content.trim()) {
      throw ApiError(
        StatusCodes.BAD_REQUEST,
        "Cannot refine an empty draft. Please generate or add content first."
      );
    }

    const messages = writingAI.buildRefinePrompt({
      type: existing.type,
      currentSubject: existing.subject,
      currentContent: existing.content,
      action,
      customInstruction,
    });

    await executeWritingStream({
      res,
      next,
      userId,
      type: existing.type,
      draftId: existing._id.toString(),
      inputs: existing.inputs?.toObject
        ? existing.inputs.toObject()
        : existing.inputs || {},
      messages,
      initialSubject: existing.subject || "",
      stageLabel: `Applying refinement (${action})...`,
      refineAction: action,
    });
  } catch (error) {
    next(error);
  }
};

export const getWritings = async (req, res, next) => {
  try {
    const data = await writingService.getWritings(req.user._id, req.query);
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Writing drafts fetched successfully", data));
  } catch (error) {
    next(error);
  }
};

export const getWritingById = async (req, res, next) => {
  try {
    const draft = await writingService.getWritingById(
      req.params.id,
      req.user._id
    );
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Writing draft fetched successfully", draft));
  } catch (error) {
    next(error);
  }
};

export const updateWriting = async (req, res, next) => {
  try {
    const updated = await writingService.updateWriting(
      req.params.id,
      req.user._id,
      req.body
    );
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Writing draft updated successfully", updated));
  } catch (error) {
    next(error);
  }
};

export const togglePin = async (req, res, next) => {
  try {
    const draft = await writingService.togglePin(req.params.id, req.user._id);
    return res
      .status(StatusCodes.OK)
      .json(
        ApiResponse(
          StatusCodes.OK,
          draft.isPinned ? "Draft pinned to top" : "Draft unpinned",
          draft
        )
      );
  } catch (error) {
    next(error);
  }
};

export const restorePreviousVersion = async (req, res, next) => {
  try {
    const draft = await writingService.restorePreviousVersion(
      req.params.id,
      req.user._id
    );
    return res
      .status(StatusCodes.OK)
      .json(
        ApiResponse(StatusCodes.OK, "Previous version restored successfully", draft)
      );
  } catch (error) {
    next(error);
  }
};

export const deleteWriting = async (req, res, next) => {
  try {
    await writingService.deleteWriting(req.params.id, req.user._id);
    return res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Writing draft deleted successfully", null));
  } catch (error) {
    next(error);
  }
};
