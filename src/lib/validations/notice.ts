import { z } from "zod";

export const createNoticeSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  content: z.string().min(5, "Content must be at least 5 characters"),
  targetRoles: z
    .array(z.string())
    .min(1, "At least one target role is required"),
  branchId: z.string().nullable().optional(),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;

export const updateNoticeSchema = createNoticeSchema.partial();

export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;
