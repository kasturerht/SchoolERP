import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function getParentUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer parent-mock-token-")) {
    return null;
  }
  
  const userId = authHeader.replace("Bearer parent-mock-token-", "").trim();
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      include: {
        parent: {
          include: {
            children: {
              select: {
                studentId: true,
              },
            },
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.error("Error in getParentUser helper:", error);
    return null;
  }
}
