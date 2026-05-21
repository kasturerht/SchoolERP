import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  apiValidationError,
  parsePagination,
} from "@/lib/api-helpers";
import { checkApiPermission, getTenantContext } from "@/lib/rbac";
import { createStaffSchema } from "@/lib/validations/staff";
import crypto from "crypto";

/**
 * GET /api/v1/staff — list staff with pagination, search, and filters
 */
export async function GET(req: NextRequest) {
  const denied = await checkApiPermission(req, "staff", "read");
  if (denied) return denied;

  const ctx = getTenantContext(req);
  const url = new URL(req.url);
  const { page, limit, search } = parsePagination(url);
  const role = url.searchParams.get("role");
  const branchId = url.searchParams.get("branchId");

  const where: Record<string, unknown> = {
    branch: { organizationId: ctx.organizationId },
  };

  // BRANCH_ADMIN can only see staff in their branch
  if (ctx.role === "BRANCH_ADMIN" && ctx.branchId) {
    where.branchId = ctx.branchId;
  } else if (branchId) {
    where.branchId = branchId;
  }

  if (role) {
    where.role = role;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  try {
    const [staff, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          gender: true,
          joinDate: true,
          status: true,
          branch: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.staff.count({ where }),
    ]);

    return apiSuccess(staff, { page, limit, total });
  } catch (error) {
    console.error("List staff error:", error);
    return apiError("INTERNAL_ERROR", "Failed to list staff", 500);
  }
}

/**
 * POST /api/v1/staff — create a new staff member
 */
export async function POST(req: NextRequest) {
  const denied = await checkApiPermission(req, "staff", "create");
  if (denied) return denied;

  const ctx = getTenantContext(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("BAD_REQUEST", "Invalid JSON body", 400);
  }

  const parsed = createStaffSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { name, email, phone, role, dateOfBirth, gender, qualification, joinDate, branchId } =
    parsed.data;

  // BRANCH_ADMIN can only create staff in their own branch
  if (ctx.role === "BRANCH_ADMIN" && ctx.branchId && branchId !== ctx.branchId) {
    return apiError("FORBIDDEN", "Cannot create staff in another branch", 403);
  }

  try {
    // Verify branch belongs to this organization
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, organizationId: ctx.organizationId, isActive: true },
    });
    if (!branch) {
      return apiError("NOT_FOUND", "Branch not found", 404);
    }

    // Auto-generate employeeId
    const employeeId = `STF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const staff = await prisma.staff.create({
      data: {
        branchId,
        employeeId,
        name,
        email: email || null,
        phone: phone || null,
        role: role || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        qualification: qualification || null,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        employeeId: true,
        gender: true,
        joinDate: true,
        status: true,
        branch: { select: { id: true, name: true } },
      },
    });

    return apiSuccess(staff, undefined, 201);
  } catch (error) {
    console.error("Create staff error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create staff", 500);
  }
}
