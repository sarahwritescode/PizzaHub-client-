import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic check only: it looks for the session cookie so signed-out users
// are bounced quickly. The real role / blocked checks happen on the server in
// the dashboard layouts (lib/session.ts) and on the backend API.
//
// Protected: every dashboard route and each menu item's details page
// (/menu/<id>). The /menu list itself stays public.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const signIn = new URL("/sign-in", request.url);
    // Remember a menu item so the sign-in form can bring the user back to it.
    const { pathname } = request.nextUrl;
    if (pathname.startsWith("/menu/")) signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/menu/:path+"],
};
