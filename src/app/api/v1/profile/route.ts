import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getAdminAuth } from "@/lib/firebase-admin";
import { apiSuccess, apiError, apiValidationError, apiNotFound } from "@/lib/api-helpers";
import { z } from "zod";
import { logAction } from "@/lib/audit";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().optional().nullable(),
});

/**
 * GET /api/v1/profile — get authenticated user's profile info
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", "Not authenticated", 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: { select: { id: true, name: true } },
        isActive: true,
        createdAt: true,
        branch: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true, slug: true, plan: true } },
      },
    });

    if (!user) return apiNotFound("User");

    const auditLogs = await prisma.auditLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return apiSuccess({
      user,
      auditLogs,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return apiError("INTERNAL_ERROR", "Failed to get profile", 500);
  }
}

/**
 * PATCH /api/v1/profile — update authenticated user's profile details
 */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", "Not authenticated", 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("BAD_REQUEST", "Invalid JSON body", 400);
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { name, phone } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!existing) return apiNotFound("User");

    // Sync Firebase display name if changed
    if (name !== existing.name) {
      try {
        await getAdminAuth().updateUser(existing.firebaseUid, { displayName: name });
      } catch (err) {
        console.error("Firebase updateUser displayName error:", err);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone: phone || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: { select: { id: true, name: true } },
        isActive: true,
        branch: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true, slug: true, plan: true } },
      },
    });

    await logAction({
      organizationId: updatedUser.organization.id,
      branchId: updatedUser.branch?.id || null,
      userId: session.user.id,
      action: "UPDATE",
      module: "USERS",
      entityId: updatedUser.id,
      details: ["name", "phone"],
    });

    return apiSuccess(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update profile", 500);
  }
}
