import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  apiValidationError,
  apiNotFound,
} from "@/lib/api-helpers";
import { checkApiPermission, getTenantContext } from "@/lib/rbac";
import { updateClassSchema } from "@/lib/validations/class";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/classes/:id — get a single class with sections, fees, branch, academicYear
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const denied = await checkApiPermission(req, "classes", "read");
  if (denied) return denied;

  const ctx = getTenantContext(req);
  const { id } = await context.params;

  try {
    const classRecord = await prisma.class.findFirst({
      where: {
        id,
        branch: { organizationId: ctx.organizationId },
      },
      include: {
        sections: { orderBy: { name: "asc" } },
        feeStructures: {
          include: { feeCategory: { select: { name: true } } },
        },
        branch: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } },
        classTeacher: { select: { id: true, name: true } },
        subjectTeachers: {
          include: { staff: { select: { id: true, name: true } } },
        },
      },
    });

    if (!classRecord) return apiNotFound("Class");

    return apiSuccess(classRecord);
  } catch (error) {
    console.error("Get class error:", error);
    return apiError("INTERNAL_ERROR", "Failed to get class", 500);
  }
}

/**
 * PATCH /api/v1/classes/:id — update a class, sync sections and fees
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  const denied = await checkApiPermission(req, "classes", "update");
  if (denied) return denied;

  const ctx = getTenantContext(req);
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("BAD_REQUEST", "Invalid JSON body", 400);
  }

  const parsed = updateClassSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  try {
    const existing = await prisma.class.findFirst({
      where: {
        id,
        branch: { organizationId: ctx.organizationId },
      },
      include: {
        sections: true,
        feeStructures: {
          include: { feeCategory: { select: { name: true } } },
        },
      },
    });

    if (!existing) return apiNotFound("Class");

    const { name, numericGrade, sections, fees, classTeacherId, subjectTeacherIds } = parsed.data;

    await prisma.$transaction(async (tx) => {
      // Update basic class fields
      const data: Record<string, unknown> = {};
      if (name !== undefined) data.name = name;
      if (numericGrade !== undefined) data.numericGrade = numericGrade;
      if (classTeacherId !== undefined) data.classTeacherId = classTeacherId || null;

      if (Object.keys(data).length > 0) {
        await tx.class.update({ where: { id }, data });
      }

      // Sync subject teachers
      if (subjectTeacherIds !== undefined) {
        await tx.classSubjectTeacher.deleteMany({ where: { classId: id } });
        if (subjectTeacherIds.length > 0) {
          await tx.classSubjectTeacher.createMany({
            data: subjectTeacherIds.map((staffId) => ({
              classId: id,
              staffId,
            })),
          });
        }
      }

      // Sync sections
      if (sections !== undefined) {
        const incomingIds = sections
          .map((s) => s.id)
          .filter((sid): sid is string => !!sid);
        const existingIds = existing.sections.map((s) => s.id);
        const toRemove = existingIds.filter((eid) => !incomingIds.includes(eid));

        // Check if any sections to remove have enrollments
        if (toRemove.length > 0) {
          const enrollmentCount = await tx.studentEnrollment.count({
            where: { sectionId: { in: toRemove } },
          });
          if (enrollmentCount > 0) {
            throw new Error("CONFLICT:Cannot remove sections that have enrolled students");
          }
          await tx.section.deleteMany({ where: { id: { in: toRemove } } });
        }

        for (const section of sections) {
          if (section.id && existingIds.includes(section.id)) {
            await tx.section.update({
              where: { id: section.id },
              data: { name: section.name },
            });
          } else {
            await tx.section.create({
              data: { classId: id, name: section.name },
            });
          }
        }
      }

      // Sync fees
      if (fees !== undefined) {
        const incomingFeeIds = fees
          .map((f) => f.id)
          .filter((fid): fid is string => !!fid);
        const existingFeeIds = existing.feeStructures.map((f) => f.id);
        const feesToRemove = existingFeeIds.filter(
          (eid) => !incomingFeeIds.includes(eid)
        );

        // Check if any fees to remove have invoice items
        if (feesToRemove.length > 0) {
          const invoiceItemCount = await tx.invoiceItem.count({
            where: { feeStructureId: { in: feesToRemove } },
          });
          if (invoiceItemCount > 0) {
            throw new Error("CONFLICT:Cannot remove fees that have invoice items");
          }
          await tx.feeStructure.deleteMany({
            where: { id: { in: feesToRemove } },
          });
        }

        for (const fee of fees) {
          // Upsert fee category by org + name
          const feeCategory = await tx.feeCategory.upsert({
            where: {
              organizationId_name: {
                organizationId: ctx.organizationId,
                name: fee.name,
              },
            },
            update: {},
            create: {
              organizationId: ctx.organizationId,
              name: fee.name,
            },
          });

          if (fee.id && existingFeeIds.includes(fee.id)) {
            await tx.feeStructure.update({
              where: { id: fee.id },
              data: {
                feeCategoryId: feeCategory.id,
                amount: fee.amount,
                frequency: "ANNUAL",
              },
            });
          } else {
            await tx.feeStructure.create({
              data: {
                classId: id,
                academicYearId: existing.academicYearId,
                feeCategoryId: feeCategory.id,
                amount: fee.amount,
                frequency: "ANNUAL",
              },
            });
          }
        }
      }
    });

    // Refetch updated class
    const updated = await prisma.class.findUnique({
      where: { id },
      include: {
        sections: { orderBy: { name: "asc" } },
        feeStructures: {
          include: { feeCategory: { select: { name: true } } },
        },
        branch: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } },
        classTeacher: { select: { id: true, name: true } },
        subjectTeachers: {
          include: { staff: { select: { id: true, name: true } } },
        },
      },
    });

    return apiSuccess(updated);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("CONFLICT:")) {
      return apiError("CONFLICT", error.message.slice(9), 409);
    }
    console.error("Update class error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update class", 500);
  }
}

/**
 * DELETE /api/v1/classes/:id — delete a class
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const denied = await checkApiPermission(req, "classes", "delete");
  if (denied) return denied;

  const ctx = getTenantContext(req);
  const { id } = await context.params;

  try {
    const existing = await prisma.class.findFirst({
      where: {
        id,
        branch: { organizationId: ctx.organizationId },
      },
    });

    if (!existing) return apiNotFound("Class");

    // Check enrollment count
    const enrollmentCount = await prisma.studentEnrollment.count({
      where: { section: { classId: id } },
    });
    if (enrollmentCount > 0) {
      return apiError(
        "CONFLICT",
        `Cannot delete: ${enrollmentCount} student${enrollmentCount > 1 ? "s" : ""} enrolled in this class`,
        409
      );
    }

    // Cascade deletes sections + fee structures via Prisma onDelete: Cascade
    await prisma.class.delete({ where: { id } });

    return apiSuccess({ id, deleted: true });
  } catch (error) {
    console.error("Delete class error:", error);
    return apiError("INTERNAL_ERROR", "Failed to delete class", 500);
  }
}
