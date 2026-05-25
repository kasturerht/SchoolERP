import { z } from "zod";

export const createSubjectMasterSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be at most 20 characters")
    .regex(
      /^[A-Z0-9_]+$/,
      "Code must be uppercase alphanumeric (A-Z, 0-9, _)"
    ),
  type: z.enum(["THEORY", "PRACTICAL", "ELECTIVE"]).default("THEORY"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
});

export const updateSubjectMasterSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be at most 20 characters")
    .regex(
      /^[A-Z0-9_]+$/,
      "Code must be uppercase alphanumeric (A-Z, 0-9, _)"
    )
    .optional(),
  type: z.enum(["THEORY", "PRACTICAL", "ELECTIVE"]).optional(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateSubjectMasterInput = z.infer<typeof createSubjectMasterSchema>;
export type UpdateSubjectMasterInput = z.infer<typeof updateSubjectMasterSchema>;
