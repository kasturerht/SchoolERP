import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";
import { getTenantContext } from "@/lib/rbac";

export async function withIdempotency(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<Response>
): Promise<Response> {
  // Only apply idempotency to mutation requests
  if (!["POST", "PUT", "PATCH"].includes(req.method)) {
    return handler(req);
  }

  const idempotencyKey = req.headers.get("Idempotency-Key");
  if (!idempotencyKey) {
    // If no key is provided, bypass idempotency (backward compatibility)
    return handler(req);
  }

  const ctx = getTenantContext(req);
  const orgId = ctx.organizationId;

  try {
    // Attempt atomic lock insertion in the database
    await prisma.idempotencyKey.create({
      data: {
        key: idempotencyKey,
        organizationId: orgId,
        status: "PROCESSING",
      },
    });
  } catch (error: any) {
    // Prisma P2002 code is a Unique constraint violation (Key already exists)
    if (error.code === "P2002") {
      return await handleDuplicateRequest(idempotencyKey, orgId);
    }
    throw error;
  }

  // If lock acquired, execute the primary handler
  try {
    // Clone the request stream so the handler can read it safely
    const response = await handler(req);

    // Read response body and cache it
    const status = response.status;
    const bodyText = await response.text();

    await prisma.idempotencyKey.update({
      where: { key: idempotencyKey },
      data: {
        status: "SUCCESS",
        responseCode: status,
        responseBody: bodyText,
      },
    });

    // Reconstruct response for client
    return new NextResponse(bodyText, {
      status,
      headers: response.headers,
    });
  } catch (handlerError) {
    console.error("Idempotency handler error, unlocking key:", handlerError);
    // On failure, delete the lock so the user can retry the operation
    await prisma.idempotencyKey.delete({
      where: { key: idempotencyKey },
    }).catch(() => {});
    
    throw handlerError;
  }
}

async function handleDuplicateRequest(key: string, orgId: string): Promise<Response> {
  const maxPolls = 15; // Max 3 seconds (15 * 200ms)
  for (let i = 0; i < maxPolls; i++) {
    const record = await prisma.idempotencyKey.findUnique({
      where: { key },
    });

    if (!record) {
      // If the record was deleted due to a failure, break out to retry
      break;
    }

    if (record.status === "SUCCESS" && record.responseCode !== null) {
      // Return the cached successful response
      return new NextResponse(record.responseBody, {
        status: record.responseCode,
        headers: {
          "Content-Type": "application/json",
          "X-Cache-Lookup": "HIT - Idempotency",
        },
      });
    }

    if (record.status === "FAILED") {
      break;
    }

    // Wait 200ms before polling again
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return apiError("CONFLICT", "Another request is currently processing this action. Please wait.", 409);
}
