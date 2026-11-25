import { PDFParse } from "pdf-parse";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/apiError.util.js";
import * as s3Storage from "./storage/s3.storage.js";
import * as resumeRepository from "../repositories/resume.repository.js";

/**
 * Validates that a buffer has a valid PDF magic header (%PDF-)
 */
export const isValidPdfBuffer = (buffer) => {
  if (!buffer || buffer.length < 5) return false;
  return (
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46 && // F
    buffer[4] === 0x2d    // -
  );
};

/**
 * Extracts raw text and page count from a PDF buffer in-memory
 */
export const extractTextFromPdfBuffer = async (buffer) => {
  if (!isValidPdfBuffer(buffer)) {
    throw ApiError(
      StatusCodes.BAD_REQUEST,
      "Invalid file format: Uploaded file is not a valid PDF document"
    );
  }

  const parser = new PDFParse({ data: buffer });
  try {
    const parsedDoc = await parser.load();
    const pageCount = parsedDoc.numPages || 1;
    const textResult = await parser.getText();

    let combinedText = "";
    let extractedContentLength = 0;
    if (textResult.pages && textResult.pages.length > 0) {
      const pageTexts = textResult.pages.map((page) => (page.text || "").trim());
      extractedContentLength = pageTexts.join("").length;
      combinedText = textResult.pages
        .map((page, idx) => `--- Page ${page.num || idx + 1} ---\n${(page.text || "").trim()}`)
        .join("\n\n");
    } else if (textResult.text) {
      combinedText = textResult.text.trim();
      extractedContentLength = combinedText.length;
    }

    if (!combinedText || extractedContentLength < 10) {
      throw ApiError(
        StatusCodes.BAD_REQUEST,
        "Could not extract readable text from PDF. The document may be image-only or scanned without OCR."
      );
    }

    return {
      rawText: combinedText,
      pageCount,
    };
  } finally {
    await parser.destroy();
  }
};

/**
 * Heuristic section segmenter to seed initial parsedSections before deep AI audit
 */
export const parseResumeSections = (text) => {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/i);

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => Boolean(l) && !/^---\s*Page\s*\d+\s*---$/i.test(l));
  const candidateName = lines[0] && lines[0].length < 40 && !lines[0].includes("@") ? lines[0] : "";

  // Common section extractors
  const extractSection = (headingRegex, nextHeadingRegex) => {
    const startMatch = text.search(headingRegex);
    if (startMatch === -1) return "";
    const remaining = text.substring(startMatch);
    const endMatch = remaining.search(nextHeadingRegex);
    return (endMatch === -1 ? remaining : remaining.substring(0, endMatch)).trim();
  };

  const sectionHeadings =
    /(?:^|\n)\s*(?:summary|experience|work experience|employment|education|skills|technical skills|projects|certifications)/i;

  const summary = extractSection(
    /(?:^|\n)\s*(?:summary|professional summary|profile|about me)[\s:]*/i,
    /(?:^|\n)\s*(?:experience|work experience|employment|education|skills|technical skills|projects)/i
  );

  return {
    contactInfo: {
      name: candidateName,
      email: emailMatch ? emailMatch[0] : "",
      phone: phoneMatch ? phoneMatch[0] : "",
      linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : "",
      github: githubMatch ? `https://${githubMatch[0]}` : "",
      portfolio: "",
    },
    summary: summary ? summary.replace(/^(?:summary|professional summary|profile|about me)[\s:]*/i, "").trim() : "",
    skills: [],
    experience: [],
    education: [],
    projects: [],
  };
};

/**
 * Direct Synchronous Fast-Path:
 * Validates PDF, extracts text in ~150ms, saves to storage, and persists Resume in DB.
 */
export const uploadAndExtractResume = async (
  userId,
  { fileBuffer, originalName, title, mimeType = "application/pdf" }
) => {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw ApiError(StatusCodes.BAD_REQUEST, "No file content received for upload");
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw ApiError(StatusCodes.BAD_REQUEST, "Resume file size must not exceed 10MB");
  }

  // 1. Extract text and page count in-memory
  const { rawText, pageCount } = await extractTextFromPdfBuffer(fileBuffer);

  // 2. Initial section segmentation
  const parsedSections = parseResumeSections(rawText);

  // 3. Save buffer to storage
  const resumeId = uuidv4();
  const safeName = originalName || "Resume.pdf";
  const ext = path.extname(safeName) || ".pdf";
  const storageKey = `resumes/${userId}/${resumeId}/original${ext}`;

  await s3Storage.saveLocalBuffer(storageKey, fileBuffer);

  let storageProvider = "local";
  if (!s3Storage.isLocalMode()) {
    try {
      await s3Storage.uploadBufferToS3(storageKey, fileBuffer, "application/pdf");
      storageProvider = "s3";
    } catch (s3Err) {
      console.warn("[Resume Storage] S3 upload warning, proceeding with local copy:", s3Err.message);
    }
  }

  // 4. Generate download URL
  const fileUrl = await s3Storage.generatePresignedDownloadUrl(storageKey);

  // 5. Create Resume document
  const finalTitle = (title && title.trim()) || safeName.replace(/\.[^/.]+$/, "");
  try {
    const resume = await resumeRepository.createResume({
      userId,
      title: finalTitle,
      originalName: safeName,
      fileUrl,
      storageKey,
      storageProvider,
      fileSize: fileBuffer.length,
      mimeType,
      pageCount,
      rawText,
      parsedSections,
      latestAudit: {
        overallScore: 0,
        subScores: {
          formatting: 0,
          impactAndMetrics: 0,
          skillsAndKeywords: 0,
          sectionStructure: 0,
        },
        keyProblems: [],
        whyItMatters: [],
        actionableRecommendations: [],
        strongSections: [],
        weakSections: [],
        missingKeywords: [],
        matchedKeywords: [],
        targetRole: "",
        targetJobDescription: "",
        analyzedAt: null,
      },
      messages: [],
    });

    return resume;
  } catch (err) {
    await s3Storage.deleteObjectFromS3(storageKey).catch(() => {});
    throw err;
  }
};

/**
 * List user resumes with search & pagination
 */
export const getResumes = async (userId, { page = 1, limit = 20, search = "" }) => {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const [resumes, total] = await Promise.all([
    resumeRepository.findResumesByUserId(userId, skip, safeLimit, search),
    resumeRepository.countResumesByUserId(userId, search),
  ]);

  return {
    resumes,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
};

/**
 * Retrieve single resume by ID with ownership verification
 */
export const getResumeById = async (id, userId) => {
  const resume = await resumeRepository.findResumeById(id);
  if (!resume) {
    throw ApiError(StatusCodes.NOT_FOUND, "Resume not found");
  }

  if (resume.userId.toString() !== userId.toString()) {
    throw ApiError(StatusCodes.FORBIDDEN, "Access denied: You do not own this resume");
  }

  // Refresh download URL if needed
  try {
    const refreshedUrl = await s3Storage.generatePresignedDownloadUrl(resume.storageKey);
    if (refreshedUrl && refreshedUrl !== resume.fileUrl) {
      resume.fileUrl = refreshedUrl;
      await resumeRepository.updateResume(resume._id, { fileUrl: refreshedUrl });
    }
  } catch (err) {
    console.warn("[Resume Service] Could not refresh download URL:", err.message);
  }

  return resume;
};

/**
 * Retrieve original PDF buffer for secure inline serving
 */
export const getResumeFileBuffer = async (id, userId) => {
  const resume = await resumeRepository.findResumeById(id);
  if (!resume) {
    throw ApiError(StatusCodes.NOT_FOUND, "Resume not found");
  }

  if (resume.userId.toString() !== userId.toString()) {
    throw ApiError(StatusCodes.FORBIDDEN, "Access denied: You do not own this resume");
  }

  const buffer = await s3Storage.getObjectBuffer(resume.storageKey);
  return {
    buffer,
    mimeType: resume.mimeType || "application/pdf",
    fileName: resume.originalName || "resume.pdf",
  };
};

/**
 * Rename resume title
 */
export const updateResumeTitle = async (id, userId, title) => {
  const resume = await resumeRepository.findResumeById(id);
  if (!resume) {
    throw ApiError(StatusCodes.NOT_FOUND, "Resume not found");
  }

  if (resume.userId.toString() !== userId.toString()) {
    throw ApiError(StatusCodes.FORBIDDEN, "Access denied: You do not own this resume");
  }

  const updated = await resumeRepository.updateResume(id, {
    title: title.trim(),
  });

  return updated;
};

/**
 * Delete resume and its storage file
 */
export const deleteResume = async (id, userId) => {
  const resume = await resumeRepository.findResumeById(id);
  if (!resume) {
    throw ApiError(StatusCodes.NOT_FOUND, "Resume not found");
  }

  if (resume.userId.toString() !== userId.toString()) {
    throw ApiError(StatusCodes.FORBIDDEN, "Access denied: You do not own this resume");
  }

  // Delete from storage
  await s3Storage.deleteObjectFromS3(resume.storageKey);

  // Delete from database
  await resumeRepository.deleteResume(id);

  return { success: true, message: "Resume deleted successfully" };
};
