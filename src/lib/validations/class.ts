import { z } from "zod";

const sectionSubjectTeacherSchema = z.object({
  subjectIndex: z.number().int().min(0),
  staffId: z.string().min(1, "Teacher is required"),
});

const sectionSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Division name is required")
    .max(20, "Division name must be at most 20 characters"),
  classTeacherId: z.string().nullable().optional(),
  subjectTeachers: z.array(sectionSubjectTeacherSchema).default([]),
});

const inlineFeeSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Fee name is required")
    .max(100, "Fee name must be at most 100 characters"),
  amount: z.number().positive("Amount must be positive"),
});

const inlineInstallmentSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Installment name is required")
    .max(100, "Installment name must be at most 100 characters"),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  lateFeeActive: z.boolean().default(false),
  lateFeePerDay: z.number().nonnegative("Late fee per day must be at least 0").default(0),
  lateFeeGrace: z.number().int().nonnegative("Grace days must be at least 0").default(0),
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
  subjectMasterIds: z.array(z.string()).default([]),
  sections: z
    .array(sectionSchema)
    .min(1, "At least one division is required"),
  fees: z.array(inlineFeeSchema).default([]),
  installments: z.array(inlineInstallmentSchema).default([]),
});

// For update, subjects are expressed as an array of { id } (keep) or { subjectMasterId } (add new)
const updateSubjectEntry = z.union([
  z.object({ id: z.string() }),
  z.object({ subjectMasterId: z.string() }),
]);

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
  subjects: z.array(updateSubjectEntry).optional(),
  sections: z.array(sectionSchema).optional(),
  fees: z.array(inlineFeeSchema).optional(),
  installments: z.array(inlineInstallmentSchema).optional(),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
