import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const publicPaths = ["/", "/pricing"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public assets and API auth routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Public marketing pages — always accessible
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Auth redirects are handled by the `authorized` callback in auth.config.ts
  // If we reach here, the user is authenticated

  // Instantiate new headers to sanitize incoming request headers
  const headers = new Headers(req.headers);

  // CRITICAL: Always strip any client-provided x-user or x-organization context headers to prevent header spoofing
  headers.delete("x-user-id");
  headers.delete("x-user-role-id");
  headers.delete("x-user-role-name");
  headers.delete("x-organization-id");
  headers.delete("x-branch-id");

  const session = req.auth;

  if (session?.user) {
    headers.set("x-user-id", session.user.id);
    headers.set("x-user-role-id", session.user.roleId);
    headers.set("x-user-role-name", session.user.roleName);
    headers.set("x-organization-id", session.user.organizationId);
    headers.set("x-branch-id", session.user.branchId ?? "");

    return NextResponse.next({ request: { headers } });
  }

  // If no session exists, return 401 for private API routes (except parent login and bearer-token authenticated endpoints)
  if (
    pathname.startsWith("/api/v1/") &&
    pathname !== "/api/v1/parent/auth/login" &&
    !req.headers.get("authorization")?.trim().startsWith("Bearer ")
  ) {
    return new NextResponse(
      JSON.stringify({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // If no session exists, forward request with sanitized (stripped) headers
  return NextResponse.next({ request: { headers } });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
