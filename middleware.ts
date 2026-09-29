import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Agar user /read, home page, static files ya images par hai toh direct aane do
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Sirf /admin route ke liye login check karo
  const token =
    request.cookies.get("sb-access-token")?.value ||
    request.cookies.get("supabase-auth-token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
