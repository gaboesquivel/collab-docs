import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic check only: send visitors without a session cookie to /login.
// Pages and actions still verify the session and the user's access themselves.
export const proxy = (request: NextRequest) => {
  const hasSession = request.cookies.has("session");
  const isLogin = request.nextUrl.pathname === "/login";

  if (!(hasSession || isLogin)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
