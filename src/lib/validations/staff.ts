import { z } from "zod";

const STAFF_ROLES = [
  "TEACHER",
  "ACCOUNTANT",
  "LIBRARIAN",
  "RECEPTIONIST",
  "TRANSPORT_MANAGER",
] as const;

const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;

const STAFF_STATUSES = ["ACTIVE", "ON_LEAVE", "RESIGNED", "TERMINATED"] as const;

export const createStaffSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone must be at most 20 characters").optional().or(z.literal("")),
  role: z.enum(STAFF_ROLES, { required_error: "Role is required" }),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(GENDERS).optional().or(z.literal("")),
  qualification: z
    .string()
    .max(200, "Qualification must be at most 200 characters")
    .optional()
    .or(z.literal("")),
  joinDate: z.string().optional().or(z.literal("")),
  branchId: z.string().min(1, "Branch is required"),
});

export const updateStaffSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone must be at most 20 characters").optional().or(z.literal("")),
  role: z.enum(STAFF_ROLES).optional(),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(GENDERS).optional().or(z.literal("")),
  qualification: z
    .string()
    .max(200, "Qualification must be at most 200 characters")
    .optional()
    .or(z.literal("")),
  joinDate: z.string().optional().or(z.literal("")),
  branchId: z.string().min(1).optional(),
  status: z.enum(STAFF_STATUSES).optional(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
