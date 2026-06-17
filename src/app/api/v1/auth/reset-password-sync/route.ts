import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, apiNotFound } from "@/lib/api-helpers";
import { logAction } from "@/lib/audit";

/**
 * POST /api/v1/auth/reset-password-sync
 * Securely synchronizes user state in MySQL after a client-side self-service password reset.
 * Verifies the oobCode via Firebase Auth REST API first to prevent unauthenticated database writes.
 */
export async function POST(req: NextRequest) {
  try {
    const { oobCode } = await req.json();
    if (!oobCode) {
      return apiError("BAD_REQUEST", "oobCode is required", 400);
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      console.error("[ResetSync] Firebase API Key is not configured in environment.");
      return apiError("INTERNAL_ERROR", "Auth service configuration error", 500);
    }

    // Verify token with Firebase Auth REST API securely on the server
    const firebaseVerifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:verifyPasswordResetCode?key=${apiKey}`;
    const verifyRes = await fetch(firebaseVerifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oobCode }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.email) {
      console.error("[ResetSync] Firebase code verification failed:", verifyData.error?.message || "Unknown error");
      return apiError("BAD_REQUEST", "The reset token is invalid or has expired", 400);
    }

    const { email } = verifyData;

    // Retrieve all user records matching the verified email
    const users = await prisma.user.findMany({
      where: { email },
    });

    if (users.length === 0) {
      return apiNotFound("User");
    }

    // Update all matching user instances in MySQL
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          forcePasswordChange: false,
          tokenVersion: { increment: 1 },
        },
      });

      // Log the event in audit logs
      await logAction({
        organizationId: user.organizationId,
        branchId: user.branchId,
        userId: user.id,
        action: "UPDATE",
        module: "USERS",
        entityId: user.id,
        details: { context: "PASSWORD_RESET_SYNC" },
      });
    }

    return apiSuccess({
      success: true,
      email,
      count: users.length,
    });
  } catch (error) {
    console.error("[ResetSync] Error during password reset sync:", error);
    return apiError("INTERNAL_ERROR", "Failed to sync account security settings", 500);
  }
}
