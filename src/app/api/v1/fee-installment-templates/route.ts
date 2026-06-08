import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helpers";
import { checkApiPermission, getTenantContext } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const denied = await checkApiPermission(req, "fees", "read");
  if (denied) return denied;

  const ctx = getTenantContext(req);
  const url = new URL(req.url);
  const classId = url.searchParams.get("classId");
  const academicYearId = url.searchParams.get("academicYearId");
  const termType = url.searchParams.get("termType") || "FULL_TERM";

  if (!classId || !academicYearId) {
    return apiError("BAD_REQUEST", "Missing classId or academicYearId", 400);
  }

  try {
    const templates = await prisma.feeInstallmentTemplate.findMany({
      where: {
        classId,
        academicYearId,
        termType: termType as any,
      },
      orderBy: { dueDate: "asc" },
    });

    return apiSuccess(templates);
  } catch (error) {
    console.error("List fee installment templates error:", error);
    return apiError("INTERNAL_ERROR", "Failed to list fee installment templates", 500);
  }
}
