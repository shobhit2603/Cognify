import { z } from "zod";

export const addMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "Message content cannot be empty"),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty"),
});
