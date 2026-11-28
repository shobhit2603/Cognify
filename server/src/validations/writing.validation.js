import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const TONE_VALUES = [
  "professional",
  "confident",
  "empathetic",
  "persuasive",
  "direct",
  "friendly",
];

export const FORMALITY_VALUES = [
  "casual",
  "semi-formal",
  "formal",
  "executive",
];

export const LENGTH_VALUES = ["concise", "medium", "detailed"];

export const REFINE_ACTIONS = [
  "shorter",
  "longer",
  "more-formal",
  "more-casual",
  "more-persuasive",
  "regenerate",
  "custom",
];

const optionalObjectId = z
  .preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().regex(objectIdRegex, "Invalid ID format").nullable().optional()
  );

export const generateEmailSchema = z.object({
  purpose: z
    .string({ required_error: "Purpose is required" })
    .trim()
    .min(1, "Purpose is required")
    .max(120, "Purpose cannot exceed 120 characters"),
  intent: z
    .string({ required_error: "Intent is required" })
    .trim()
    .min(1, "Intent is required")
    .max(500, "Intent cannot exceed 500 characters"),
  context: z
    .string({ required_error: "Context is required" })
    .trim()
    .min(3, "Please provide a bit more context")
    .max(6000, "Context cannot exceed 6000 characters"),
  replyToEmail: z
    .string()
    .trim()
    .max(6000, "Reply-to email cannot exceed 6000 characters")
    .optional()
    .default(""),
  recipientContext: z
    .string()
    .trim()
    .max(300, "Recipient context cannot exceed 300 characters")
    .optional()
    .default(""),
  tone: z.enum(TONE_VALUES).default("professional"),
  formality: z.enum(FORMALITY_VALUES).default("semi-formal"),
  length: z.enum(LENGTH_VALUES).default("medium"),
  title: z
    .string()
    .trim()
    .max(140, "Title cannot exceed 140 characters")
    .optional(),
  draftId: optionalObjectId,
});

export const generateCoverLetterSchema = z
  .object({
    jobDescription: z
      .string({ required_error: "Job description is required" })
      .trim()
      .min(20, "Job description must be at least 20 characters")
      .max(12000, "Job description cannot exceed 12000 characters"),
    resumeId: optionalObjectId,
    userBackground: z
      .string()
      .trim()
      .max(8000, "Background cannot exceed 8000 characters")
      .optional()
      .default(""),
    targetCompany: z
      .string()
      .trim()
      .max(120, "Target company cannot exceed 120 characters")
      .optional()
      .default(""),
    targetRole: z
      .string()
      .trim()
      .max(120, "Target role cannot exceed 120 characters")
      .optional()
      .default(""),
    tone: z.enum(TONE_VALUES).default("professional"),
    length: z.enum(LENGTH_VALUES).default("medium"),
    title: z
      .string()
      .trim()
      .max(140, "Title cannot exceed 140 characters")
      .optional(),
    draftId: optionalObjectId,
  })
  .refine(
    (data) => Boolean(data.resumeId) || Boolean(data.userBackground?.trim()),
    {
      message:
        "Please select a resume from Resume Studio or provide your background details.",
      path: ["userBackground"],
    }
  );

export const refineWritingSchema = z
  .object({
    action: z.enum(REFINE_ACTIONS),
    customInstruction: z
      .string()
      .trim()
      .max(1000, "Custom instruction cannot exceed 1000 characters")
      .optional()
      .default(""),
  })
  .refine(
    (data) =>
      data.action !== "custom" || Boolean(data.customInstruction?.trim()),
    {
      message: "Custom instruction is required when action is 'custom'.",
      path: ["customInstruction"],
    }
  );

export const updateWritingSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .max(140, "Title cannot exceed 140 characters")
      .optional(),
    subject: z
      .string()
      .trim()
      .max(200, "Subject cannot exceed 200 characters")
      .optional(),
    content: z
      .string()
      .max(25000, "Content cannot exceed 25000 characters")
      .optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.subject !== undefined ||
      data.content !== undefined,
    {
      message: "At least one field (title, subject, or content) is required.",
    }
  );

export const getWritingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  type: z.enum(["all", "email", "cover-letter"]).default("all"),
  search: z.string().trim().max(120).optional().default(""),
});
