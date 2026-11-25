import { StatusCodes } from "http-status-codes";
import * as resumeService from "../services/resume.service.js";
import * as resumeAnalysisService from "../services/resumeAnalysis.service.js";
import ApiResponse from "../utils/apiResponse.util.js";
import ApiError from "../utils/apiError.util.js";

/**
 * Handle direct synchronous PDF upload & in-memory extraction
 */
export const uploadResume = async (req, res, next) => {
  try {
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || "");
    if (!buffer || buffer.length === 0) {
      return next(
        ApiError(StatusCodes.BAD_REQUEST, "No PDF file buffer received in request body")
      );
    }

    const rawFileName = req.query.fileName || req.headers["x-file-name"] || "Resume.pdf";
    let fileName = "Resume.pdf";
    try {
      fileName = decodeURIComponent(rawFileName);
    } catch {
      fileName = rawFileName;
    }

    const rawTitle = req.query.title || req.headers["x-title"] || fileName.replace(/\.[^/.]+$/, "");
    let title = fileName.replace(/\.[^/.]+$/, "");
    try {
      title = decodeURIComponent(rawTitle);
    } catch {
      title = rawTitle;
    }

    const resume = await resumeService.uploadAndExtractResume(req.user._id, {
      fileBuffer: buffer,
      originalName: fileName,
      title,
      mimeType: "application/pdf",
    });

    res
      .status(StatusCodes.CREATED)
      .json(ApiResponse(StatusCodes.CREATED, "Resume uploaded and extracted successfully", resume));
  } catch (error) {
    next(error);
  }
};

/**
 * List all user resumes with pagination and search
 */
export const getResumes = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const data = await resumeService.getResumes(req.user._id, { page, limit, search });
    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Resumes retrieved successfully", data));
  } catch (error) {
    next(error);
  }
};

/**
 * Get single resume with parsed sections, latest audit, and chat history
 */
export const getResumeById = async (req, res, next) => {
  try {
    const resume = await resumeService.getResumeById(req.params.id, req.user._id);
    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Resume retrieved successfully", resume));
  } catch (error) {
    next(error);
  }
};

/**
 * Serve raw PDF file securely inline for the Right Preview Panel
 */
export const getResumeFile = async (req, res, next) => {
  try {
    const { buffer, mimeType, fileName } = await resumeService.getResumeFileBuffer(
      req.params.id,
      req.user._id
    );

    res.setHeader("Content-Type", mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(fileName)}"`
    );
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Rename resume title
 */
export const updateResumeTitle = async (req, res, next) => {
  try {
    const updated = await resumeService.updateResumeTitle(
      req.params.id,
      req.user._id,
      req.body.title
    );
    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "Resume title updated successfully", updated));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete resume and its storage file
 */
export const deleteResume = async (req, res, next) => {
  try {
    const result = await resumeService.deleteResume(req.params.id, req.user._id);
    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, result.message, null));
  } catch (error) {
    next(error);
  }
};

/**
 * Run full 4-dimensional ATS diagnostic audit (with optional Job Description)
 */
export const auditResume = async (req, res, next) => {
  try {
    const { jobDescription, targetRole } = req.body || {};
    const result = await resumeAnalysisService.runResumeAudit({
      resumeId: req.params.id,
      userId: req.user._id,
      jobDescription,
      targetRole,
    });

    res
      .status(StatusCodes.OK)
      .json(ApiResponse(StatusCodes.OK, "ATS audit completed successfully", result));
  } catch (error) {
    next(error);
  }
};

/**
 * Interactive Resume Chat & Section Optimization (SSE streaming)
 */
export const chatResume = async (req, res, next) => {
  try {
    const { message, mode, jobDescription } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    try {
      const stream = resumeAnalysisService.streamResumeChat({
        resumeId: req.params.id,
        userId: req.user._id,
        userMessage: message,
        mode: mode || "general",
        jobDescription: jobDescription || "",
      });

      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      res.end();
    } catch (streamErr) {
      res.write(
        `data: ${JSON.stringify({ event: "error", error: streamErr.message })}\n\n`
      );
      res.end();
    }
  } catch (error) {
    next(error);
  }
};
