import { z } from "zod";

export const createChatSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").optional(),
});

export const updateChatSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").optional(),
  pinned: z.boolean().optional(),
}).refine(data => data.title !== undefined || data.pinned !== undefined, {
  message: "At least one field (title or pinned) must be provided for update",
});
