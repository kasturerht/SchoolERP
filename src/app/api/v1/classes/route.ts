import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  apiValidationError,
} from "@/lib/api-helpers";
import { checkApiPermission, getTenantContext } from "@/lib/rbac";
import { createClassSchema } from "@/lib/validations/class";

/**
 * GET /api/v1/classes — list classes for a branch (current academic year)
 * When ?paginated=true, returns classes with counts for the list page
 */
export async function GET(req: NextRequest) {
  const ctx = getTenantContext(req);
  const url = new URL(req.url);
  const paginated = url.searchParams.get("paginated") === "true";

  if (paginated) {
    // Paginated mode for the classes list page
    const denied = await checkApiPermission(req, "classes", "read");
    if (denied) return denied;

    const branchId = url.searchParams.get("branchId") || undefined;

    try {
      const where: Record<string, unknown> = {
        branch: { organizationId: ctx.organizationId },
      };
      if (branchId) {
        where.branchId = branchId;
      }

      const classes = await prisma.class.findMany({
        where,
        include: {
          branch: { select: { id: true, name: true } },
          academicYear: { select: { id: true, name: true } },
          _count: { select: { sections: true, feeStructures: true } },
        },
        orderBy: [{ numericGrade: "asc" }, { name: "asc" }],
      });

      return apiSuccess(classes);
    } catch (error) {
      console.error("List classes (paginated) error:", error);
      return apiError("INTERNAL_ERROR", "Failed to list classes", 500);
    }
  }

  // Lightweight response for student form dropdown (original behaviour)
  const denied = await checkApiPermission(req, "students", "read");
  if (denied) return denied;

  const branchId = url.searchParams.get("branchId");

  if (!branchId) {
    return apiError("BAD_REQUEST", "branchId is required", 400);
  }

  // Verify branch belongs to organization
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, organizationId: ctx.organizationId, isActive: true },
  });
  if (!branch) {
    return apiError("NOT_FOUND", "Branch not found", 404);
  }

  try {
    // Find the current academic year for this organization
    const academicYear = await prisma.academicYear.findFirst({
      where: { organizationId: ctx.organizationId, isCurrent: true },
    });

    if (!academicYear) {
      return apiSuccess([]);
    }

    const classes = await prisma.class.findMany({
      where: {
        branchId,
        academicYearId: academicYear.id,
      },
      select: {
        id: true,
        name: true,
        numericGrade: true,
      },
      orderBy: { numericGrade: "asc" },
    });

    return apiSuccess(classes);
  } catch (error) {
    console.error("List classes error:", error);
    return apiError("INTERNAL_ERROR", "Failed to list classes", 500);
  }
}

/**
 * POST /api/v1/classes — create a new class with sections and fees
 */
export async function POST(req: NextRequest) {
  const denied = await checkApiPermission(req, "classes", "create");
  if (denied) return denied;

  const ctx = getTenantContext(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("BAD_REQUEST", "Invalid JSON body", 400);
  }

  const parsed = createClassSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { name, numericGrade, branchId, academicYearId, sections, fees } =
    parsed.data;

  try {
    // Verify branch belongs to organization
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, organizationId: ctx.organizationId, isActive: true },
    });
    if (!branch) {
      return apiError("NOT_FOUND", "Branch not found", 404);
    }

    // Verify academic year belongs to organization
    const academicYear = await prisma.academicYear.findFirst({
      where: { id: academicYearId, organizationId: ctx.organizationId },
    });
    if (!academicYear) {
      return apiError("NOT_FOUND", "Academic year not found", 404);
    }

    // Check name uniqueness within branch + academic year
    const existing = await prisma.class.findFirst({
      where: { branchId, academicYearId, name },
    });
    if (existing) {
      return apiError(
        "CONFLICT",
        "A class with this name already exists for this branch and academic year",
        409
      );
    }

    const classRecord = await prisma.$transaction(async (tx) => {
      // Create class
      const cls = await tx.class.create({
        data: {
          branchId,
          academicYearId,
          name,
          numericGrade,
        },
      });

      // Create sections
      await tx.section.createMany({
        data: sections.map((s) => ({
          classId: cls.id,
          name: s.name,
        })),
      });

      // Create fees
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

        await tx.feeStructure.create({
          data: {
            classId: cls.id,
            academicYearId,
            feeCategoryId: feeCategory.id,
            amount: fee.amount,
            frequency: fee.frequency,
          },
        });
      }

      return cls;
    });

    // Refetch full record
    const full = await prisma.class.findUnique({
      where: { id: classRecord.id },
      include: {
        sections: { orderBy: { name: "asc" } },
        feeStructures: {
          include: { feeCategory: { select: { name: true } } },
        },
        branch: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } },
      },
    });

    return apiSuccess(full, undefined, 201);
  } catch (error) {
    console.error("Create class error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create class", 500);
  }
}
