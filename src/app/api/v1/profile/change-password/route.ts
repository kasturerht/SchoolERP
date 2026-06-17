import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, apiNotFound } from "@/lib/api-helpers";
import { logAction } from "@/lib/audit";

/**
 * POST /api/v1/profile/change-password — Sync database user state after self-service password update.
 * Resets the forcePasswordChange flag and increments tokenVersion to invalidate other active sessions.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", "Not authenticated", 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return apiNotFound("User");
    }

    // Invalidate other sessions by incrementing tokenVersion and reset forcePasswordChange flag
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        forcePasswordChange: false,
        tokenVersion: { increment: 1 },
      },
    });

    await logAction({
      organizationId: user.organizationId,
      branchId: user.branchId,
      userId: user.id,
      action: "UPDATE",
      module: "USERS",
      entityId: user.id,
      details: { context: "PROFILE_PASSWORD_CHANGE_SELF" },
    });

    return apiSuccess({
      success: true,
      tokenVersion: updatedUser.tokenVersion,
    });
  } catch (error) {
    console.error("Profile change-password API error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update user security record", 500);
  }
}
