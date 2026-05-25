import { z } from "zod";

const sectionSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Section name is required")
    .max(20, "Section name must be at most 20 characters"),
});

const inlineFeeSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Fee name is required")
    .max(100, "Fee name must be at most 100 characters"),
  amount: z.number().positive("Amount must be positive"),
});

export const createClassSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  numericGrade: z
    .number()
    .int("Grade must be a whole number")
    .min(0, "Grade must be at least 0")
    .max(20, "Grade must be at most 20"),
  branchId: z.string().min(1, "Branch is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  classTeacherId: z.string().nullable().optional(),
  subjectTeacherIds: z.array(z.string()).default([]),
  sections: z
    .array(sectionSchema)
    .min(1, "At least one section is required"),
  fees: z.array(inlineFeeSchema).default([]),
});

export const updateClassSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  numericGrade: z
    .number()
    .int("Grade must be a whole number")
    .min(0, "Grade must be at least 0")
    .max(20, "Grade must be at most 20")
    .optional(),
  branchId: z.string().optional(),
  academicYearId: z.string().optional(),
  classTeacherId: z.string().nullable().optional(),
  subjectTeacherIds: z.array(z.string()).optional(),
  sections: z.array(sectionSchema).optional(),
  fees: z.array(inlineFeeSchema).optional(),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
