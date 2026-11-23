import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, "Title cannot exceed 120 characters")
    .optional(),
  originalContent: z.string().optional(),
  folderId: z
    .string()
    .regex(objectIdRegex, "Invalid folder ID format")
    .nullable()
    .optional(),
});

export const updateNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, "Title cannot exceed 120 characters")
    .optional(),
  originalContent: z.string().optional(),
  enhancedContent: z.string().optional(),
  folderId: z
    .string()
    .regex(objectIdRegex, "Invalid folder ID format")
    .nullable()
    .optional(),
  isPinned: z.boolean().optional(),
});

export const moveNoteSchema = z.object({
  folderId: z
    .string()
    .regex(objectIdRegex, "Invalid folder ID format")
    .nullable(),
});

export const enhanceNoteSchema = z.object({
  frameworkId: z.string().trim().nullable().optional(),
  customInstructions: z
    .string()
    .trim()
    .max(1000, "Custom instructions cannot exceed 1000 characters")
    .nullable()
    .optional(),
  presetInstructions: z
    .string()
    .trim()
    .max(2000, "Preset instructions cannot exceed 2000 characters")
    .nullable()
    .optional(),
});

export const createFolderSchema = z.object({
  name: z
    .string({ required_error: "Folder name is required" })
    .trim()
    .min(1, "Folder name cannot be empty")
    .max(60, "Folder name cannot exceed 60 characters"),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color code")
    .optional(),
});

export const updateFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name cannot be empty")
    .max(60, "Folder name cannot exceed 60 characters")
    .optional(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color code")
    .optional(),
}).refine(data => data.name !== undefined || data.color !== undefined, {
  message: "At least one field (name or color) must be provided for update",
});
