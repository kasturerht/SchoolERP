import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/rbac";
import { apiSuccess, apiError } from "@/lib/api-helpers";
import type { UserRole } from "@prisma/client";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return apiError("UNAUTHORIZED", "Not authenticated", 401);
  }

  const permissions = await getUserPermissions(
    session.user.id,
    session.user.role as UserRole
  );

  return apiSuccess({
    role: session.user.role,
    permissions: Array.from(permissions),
  });
}
