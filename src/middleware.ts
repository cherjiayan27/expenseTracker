import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@/server/supabase/client.middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Define route types early to avoid unnecessary auth checks
  const isPublicRoute = pathname === "/";
  const isAuthRoute = pathname.startsWith("/login");
  const isAppRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/categories");

  // Skip auth check entirely for landing page - no session needed
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareClient(request);

  // Only call getSession() when we actually need to check auth
  // This avoids 200-500ms network request for public navigation
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect unauthenticated users away from protected routes
  if (isAppRoute && !session) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from login page
  if (isAuthRoute && session) {
    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Return the response with potentially updated cookies
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

