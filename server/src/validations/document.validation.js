import { z } from "zod";

export const getUploadUrlSchema = z.object({
  fileName: z
    .string({ required_error: "File name is required" })
    .min(1, "File name cannot be empty")
    .refine(
      (name) => name.toLowerCase().endsWith(".pdf"),
      "Only PDF documents are supported"
    ),
  mimeType: z
    .string({ required_error: "MIME type is required" })
    .refine(
      (type) => type === "application/pdf",
      "Only application/pdf MIME type is allowed"
    ),
  size: z
    .number({ required_error: "File size is required" })
    .min(1, "File cannot be empty")
    .max(25 * 1024 * 1024, "File size must not exceed 25MB"),
});

export const askDocumentSchema = z.object({
  question: z
    .string({ required_error: "Question is required" })
    .trim()
    .min(1, "Question cannot be empty")
    .max(2000, "Question is too long (maximum 2000 characters)"),
});
