import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Sirf /admin ko protect karo, baaki sab public ke liye khula rahe
  if (path.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("sb-access-token") || request.cookies.get("supabase-auth-token");
    
    // Agar auth token nahi milta toh login par bhejo
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
