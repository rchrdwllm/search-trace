import { NextResponse, type NextRequest } from "next/server";
export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) return NextResponse.next();
  const hasSessionCookie = request.cookies.get("better-auth.session_token") || request.cookies.get("__Secure-better-auth.session_token");
  if (!hasSessionCookie) return NextResponse.redirect(new URL(`/sign-in?next=${encodeURIComponent(request.nextUrl.pathname)}`, request.url));
  return NextResponse.next();
}
export const config = { matcher: ["/dashboard/:path*"] };
