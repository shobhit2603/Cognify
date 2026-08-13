import { z } from "zod";

export const addMessageSchema = z.object({
  role: z.literal("user", {
    errorMap: () => ({ message: "Role must be 'user'" })
  }),
  content: z.string().trim().min(1, "Message content cannot be empty"),
});

export const updateMessageSchema = z.object({
  content: z.string().trim().min(1, "Message content cannot be empty"),
});
