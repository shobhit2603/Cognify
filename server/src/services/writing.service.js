import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/apiError.util.js";
import * as writingRepository from "../repositories/writing.repository.js";
import * as resumeRepository from "../repositories/resume.repository.js";

const MAX_RESUME_CONTEXT_CHARS = 6000;
const patchChainsByDraftId = new Map();

function serializeDraftMutation(draftId, task) {
  const key = String(draftId);
  const previous = patchChainsByDraftId.get(key) || Promise.resolve();
  const next = previous.catch(() => {}).then(task);
  const tracked = next
    .catch(() => {})
    .finally(() => {
      if (patchChainsByDraftId.get(key) === tracked) {
        patchChainsByDraftId.delete(key);
      }
    });
  patchChainsByDraftId.set(key, tracked);
  return next;
}

function assertValidObjectId(id, label = "ID") {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError(StatusCodes.BAD_REQUEST, `Invalid ${label} format`);
  }
}

/**
 * Formats parsedSections + rawText from a user-owned Resume into compact prompt context.
 */
function formatResumeContext(resume) {
  const parts = [];
  const sections = resume.parsedSections || {};

  if (sections.contactInfo?.name) {
    parts.push(`Candidate Name: ${sections.contactInfo.name}`);
  }
  if (sections.summary) {
    parts.push(`Summary: ${sections.summary}`);
  }
  if (Array.isArray(sections.skills) && sections.skills.length > 0) {
    parts.push(`Key Skills: ${sections.skills.join(", ")}`);
  }

  const rawText = (resume.rawText || "").trim();
  if (rawText) {
    parts.push(`Full Resume Text:\n${rawText}`);
  }

  const combined = parts.join("\n\n").trim();
  if (combined.length <= MAX_RESUME_CONTEXT_CHARS) {
    return combined;
  }
  return `${combined.slice(0, MAX_RESUME_CONTEXT_CHARS)}\n...[truncated]`;
}

/**
 * Verifies Resume Studio ownership strictly server-side when resumeId is provided.
 */
export const resolveCoverLetterContext = async (
  userId,
  { resumeId, userBackground = "" }
) => {
  if (!resumeId) {
    return {
      resumeId: null,
      resumeTitle: "",
      resumeContext: "",
      userBackground: userBackground.trim(),
    };
  }

  assertValidObjectId(resumeId, "resumeId");
  const resume = await resumeRepository.findResumeByIdAndUserId(
    resumeId,
    userId
  );
  if (!resume) {
    throw ApiError(StatusCodes.NOT_FOUND, "Selected resume not found");
  }

  return {
    resumeId: resume._id,
    resumeTitle: resume.title || resume.originalName || "Resume",
    resumeContext: formatResumeContext(resume),
    userBackground: userBackground.trim(),
  };
};

export const getWritings = async (
  userId,
  { page = 1, limit = 20, type = "all", search = "" } = {}
) => {
  const [items, total] = await Promise.all([
    writingRepository.findPaginatedByUserId(userId, {
      page,
      limit,
      type,
      search,
    }),
    writingRepository.countByUserId(userId, { type, search }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};

export const getWritingById = async (id, userId) => {
  assertValidObjectId(id, "draft ID");
  const draft = await writingRepository.findByIdAndUserId(id, userId);
  if (!draft) {
    throw ApiError(StatusCodes.NOT_FOUND, "Writing draft not found");
  }
  return draft;
};

export const updateWriting = async (id, userId, updateData) => {
  assertValidObjectId(id, "draft ID");

  return serializeDraftMutation(id, async () => {
    const existing = await writingRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw ApiError(StatusCodes.NOT_FOUND, "Writing draft not found");
    }

    const sanitized = {};
    if (updateData.title !== undefined) {
      sanitized.title = updateData.title.trim() || "Untitled Draft";
    }
    if (updateData.subject !== undefined) {
      sanitized.subject = updateData.subject.trim();
    }
    if (updateData.content !== undefined) {
      sanitized.content = updateData.content;
    }

    return await writingRepository.update(id, userId, sanitized);
  });
};

export const togglePin = async (id, userId) => {
  assertValidObjectId(id, "draft ID");
  const draft = await writingRepository.findByIdAndUserId(id, userId);
  if (!draft) {
    throw ApiError(StatusCodes.NOT_FOUND, "Writing draft not found");
  }

  return await writingRepository.update(id, userId, {
    isPinned: !draft.isPinned,
  });
};

export const deleteWriting = async (id, userId) => {
  assertValidObjectId(id, "draft ID");
  const deleted = await writingRepository.remove(id, userId);
  if (!deleted) {
    throw ApiError(StatusCodes.NOT_FOUND, "Writing draft not found");
  }
  return deleted;
};

/**
 * Persists newly generated or refined/regenerated draft with 1-level backup and optimistic retry.
 */
export const saveGeneratedDraft = async ({
  userId,
  draftId = null,
  type,
  title = null,
  resolveTitle = null,
  subject = "",
  inputs = {},
  content,
  metadata = {},
}) => {
  if (!draftId) {
    const initialTitle =
      (title && title.trim()) ||
      (resolveTitle ? await resolveTitle("") : "") ||
      "Untitled Draft";

    return await writingRepository.create({
      userId,
      type,
      title: initialTitle,
      subject,
      inputs,
      generatedContent: content,
      content,
      previousContent: null,
      previousSubject: null,
      metadata: {
        ...metadata,
        generatedAt: new Date(),
      },
    });
  }

  assertValidObjectId(draftId, "draft ID");

  for (let attempt = 0; attempt < 3; attempt++) {
    const latest = await writingRepository.findByIdAndUserId(draftId, userId);
    if (!latest) {
      throw ApiError(StatusCodes.NOT_FOUND, "Writing draft not found");
    }

    let nextTitle = latest.title;
    if (title && title.trim()) {
      nextTitle = title.trim();
    } else if (
      (!latest.title || latest.title.trim() === "Untitled Draft") &&
      resolveTitle
    ) {
      nextTitle = (await resolveTitle(latest.title)) || latest.title;
    }

    const updated = await writingRepository.update(
      draftId,
      userId,
      {
        title: nextTitle || "Untitled Draft",
        subject: type === "email" ? subject : latest.subject,
        inputs: Object.keys(inputs).length > 0 ? inputs : latest.inputs,
        generatedContent: content,
        content,
        previousContent: latest.content ?? null,
        previousSubject: latest.subject ?? null,
        metadata: {
          ...(latest.metadata?.toObject ? latest.metadata.toObject() : latest.metadata || {}),
          ...metadata,
          generatedAt: new Date(),
        },
      },
      { revision: latest.revision ?? 0 }
    );

    if (updated) return updated;
  }

  throw ApiError(
    StatusCodes.CONFLICT,
    "Failed to save generated draft due to a concurrent update"
  );
};

/**
 * Restores the 1-level backed-up version by swapping current and previous content/subject.
 */
export const restorePreviousVersion = async (id, userId) => {
  assertValidObjectId(id, "draft ID");
  const draft = await writingRepository.findByIdAndUserId(id, userId);
  if (!draft) {
    throw ApiError(StatusCodes.NOT_FOUND, "Writing draft not found");
  }

  if (draft.previousContent === null || draft.previousContent === undefined) {
    throw ApiError(
      StatusCodes.BAD_REQUEST,
      "No previous version available to restore"
    );
  }

  const restored = await writingRepository.update(
    id,
    userId,
    {
      content: draft.previousContent,
      previousContent: draft.content,
      subject:
        draft.type === "email" && draft.previousSubject !== null
          ? draft.previousSubject
          : draft.subject,
      previousSubject:
        draft.type === "email" ? draft.subject : draft.previousSubject,
    },
    { revision: draft.revision ?? 0 }
  );

  if (!restored) {
    throw ApiError(
      StatusCodes.CONFLICT,
      "Draft was modified concurrently. Please try restoring again."
    );
  }

  return restored;
};
