import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic check only: send visitors without a session cookie to /login.
// Pages and actions still verify the session and the user's access themselves.
export const proxy = (request: NextRequest) => {
  const hasSession = request.cookies.has("session");
  const { pathname } = request.nextUrl;
  // Public pages: sign-in, and the submission page for reviewers.
  const isPublic = pathname === "/login" || pathname === "/submission";

  if (!(hasSession || isPublic)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
