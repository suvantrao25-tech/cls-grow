import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  const protectedAdminRoute =
    pathname === "/admin/dashboard" ||
    pathname.startsWith("/admin/dashboard/");

  const protectedBusinessRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");

  // Admin dashboard is additionally protected
  // by the dashboard's server/API authorization.
  if (protectedAdminRoute || protectedBusinessRoute) {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/dashboard/:path*",
  ],
};