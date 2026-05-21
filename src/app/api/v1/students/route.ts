import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  apiValidationError,
  parsePagination,
} from "@/lib/api-helpers";
import { checkApiPermission, getTenantContext } from "@/lib/rbac";
import { createStudentSchema } from "@/lib/validations/student";
import { saveUploadedImage, UploadError } from "@/lib/upload";
import crypto from "crypto";

/**
 * GET /api/v1/students — list students with pagination, search, and filters
 */
export async function GET(req: NextRequest) {
  const denied = await checkApiPermission(req, "students", "read");
  if (denied) return denied;

  const ctx = getTenantContext(req);
  const url = new URL(req.url);
  const { page, limit, search } = parsePagination(url);
  const branchId = url.searchParams.get("branchId");

  const where: Record<string, unknown> = {
    branch: { organizationId: ctx.organizationId },
  };

  if (ctx.role === "BRANCH_ADMIN" && ctx.branchId) {
    where.branchId = ctx.branchId;
  } else if (branchId) {
    where.branchId = branchId;
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { admissionNo: { contains: search } },
    ];
  }

  try {
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNo: true,
          gender: true,
          status: true,
          admissionDate: true,
          branch: { select: { id: true, name: true } },
          enrollments: {
            take: 1,
            orderBy: { enrolledAt: "desc" },
            select: {
              section: {
                select: {
                  id: true,
                  name: true,
                  class: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.student.count({ where }),
    ]);

    return apiSuccess(students, { page, limit, total });
  } catch (error) {
    console.error("List students error:", error);
    return apiError("INTERNAL_ERROR", "Failed to list students", 500);
  }
}

/**
 * POST /api/v1/students — create a new student (accepts FormData for file uploads)
 */
export async function POST(req: NextRequest) {
  const denied = await checkApiPermission(req, "students", "create");
  if (denied) return denied;

  const ctx = getTenantContext(req);

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return apiError("BAD_REQUEST", "Invalid form data", 400);
  }

  // Extract text fields from FormData
  const fields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      fields[key] = value;
    }
  }

  const parsed = createStudentSchema.safeParse(fields);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const data = parsed.data;

  // BRANCH_ADMIN can only create students in their own branch
  if (ctx.role === "BRANCH_ADMIN" && ctx.branchId && data.branchId !== ctx.branchId) {
    return apiError("FORBIDDEN", "Cannot create student in another branch", 403);
  }

  try {
    // Verify branch belongs to this organization
    const branch = await prisma.branch.findFirst({
      where: { id: data.branchId, organizationId: ctx.organizationId, isActive: true },
    });
    if (!branch) {
      return apiError("NOT_FOUND", "Branch not found", 404);
    }

    // Verify section exists and get its class + academic year
    const section = await prisma.section.findFirst({
      where: { id: data.sectionId },
      include: {
        class: {
          include: { academicYear: true },
        },
      },
    });
    if (!section || section.class.branchId !== data.branchId) {
      return apiError("NOT_FOUND", "Section not found for this branch", 404);
    }

    // Auto-generate admissionNo
    const admissionNo = `ADM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    // Handle photo upload
    let photoPath: string | null = null;
    const photoFile = formData.get("photo");
    if (photoFile instanceof File && photoFile.size > 0) {
      try {
        const result = await saveUploadedImage(photoFile, "uploads/student-photos", admissionNo);
        photoPath = result.filePath;
      } catch (error) {
        if (error instanceof UploadError) {
          return apiError("VALIDATION_ERROR", `Photo: ${error.message}`, 422);
        }
      }
    }

    // Handle ID document upload
    let idDocumentPath: string | null = null;
    const idDocFile = formData.get("idDocument");
    if (idDocFile instanceof File && idDocFile.size > 0) {
      try {
        const result = await saveUploadedImage(idDocFile, "uploads/student-documents", admissionNo);
        idDocumentPath = result.filePath;
      } catch (error) {
        if (error instanceof UploadError) {
          return apiError("VALIDATION_ERROR", `ID Document: ${error.message}`, 422);
        }
      }
    }

    // Create student + enrollment in a transaction
    const student = await prisma.$transaction(async (tx) => {
      const created = await tx.student.create({
        data: {
          branchId: data.branchId,
          admissionNo,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender,
          bloodGroup: data.bloodGroup || null,
          photo: photoPath,
          address: data.address,
          pincode: data.pincode,
          previousSchool: data.previousSchool || null,
          emergencyContact1: data.emergencyContact1,
          emergencyContact2: data.emergencyContact2 || null,
          idType: data.idType || null,
          idNumber: data.idNumber || null,
          idDocument: idDocumentPath,
          guardianName: data.guardianName || null,
          fatherName: data.fatherName || null,
          fatherPhone: data.fatherPhone || null,
          fatherEmail: data.fatherEmail || null,
          fatherOccupation: data.fatherOccupation || null,
          motherName: data.motherName || null,
          motherPhone: data.motherPhone || null,
          motherEmail: data.motherEmail || null,
          motherOccupation: data.motherOccupation || null,
          admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNo: true,
          gender: true,
          status: true,
          admissionDate: true,
          branch: { select: { id: true, name: true } },
        },
      });

      // Create enrollment for current academic year
      await tx.studentEnrollment.create({
        data: {
          studentId: created.id,
          academicYearId: section.class.academicYearId,
          sectionId: data.sectionId,
        },
      });

      return created;
    });

    return apiSuccess(student, undefined, 201);
  } catch (error) {
    console.error("Create student error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create student", 500);
  }
}
