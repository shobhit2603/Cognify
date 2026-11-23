import { z } from "zod";

export const getDashboardActivitySchema = z.object({
  category: z
    .enum(["all", "01", "02", "03", "04", "05"])
    .default("all")
    .optional(),
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return 8;
      const parsed = typeof val === "number" ? val : parseInt(val, 10);
      if (isNaN(parsed) || parsed < 1) return 8;
      return Math.min(parsed, 10);
    }),
});
