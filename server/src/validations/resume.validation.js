import { z } from "zod";

export const uploadResumeQuerySchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, "Title cannot exceed 120 characters")
    .optional(),
  fileName: z
    .string()
    .trim()
    .max(255, "File name is too long")
    .optional(),
});

export const updateResumeTitleSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(120, "Title cannot exceed 120 characters"),
});

export const resumeAuditSchema = z.object({
  jobDescription: z
    .string()
    .trim()
    .max(15000, "Job description is too long (maximum 15000 characters)")
    .optional(),
  targetRole: z
    .string()
    .trim()
    .max(120, "Target role is too long (maximum 120 characters)")
    .optional(),
});

export const resumeChatSchema = z.object({
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message cannot be empty")
    .max(6000, "Message cannot exceed 6000 characters"),
  mode: z
    .enum(["general", "audit", "optimize-section", "jd-match"])
    .default("general"),
  jobDescription: z
    .string()
    .trim()
    .max(15000, "Job description is too long")
    .optional(),
});

export const getResumesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  search: z.string().trim().optional(),
});
