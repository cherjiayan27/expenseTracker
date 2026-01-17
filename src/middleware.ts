import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@/server/supabase/client.middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Define route types
  const isLandingPage = pathname === "/";
  const isAuthRoute = pathname.startsWith("/login");
  const isAppRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/categories") || pathname.startsWith("/budget");

  // Skip auth check for landing page - let users see it first
  // Authenticated users click "Get Started" → /login → redirected to /dashboard
  if (isLandingPage) {
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareClient(request);

  // Get session for auth checks
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

