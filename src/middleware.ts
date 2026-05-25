import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder("utf-8");
    const jsonPayload = decoder.decode(bytes);
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

function isTokenValid(token: string) {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    return false;
  }
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const authenticated = token ? isTokenValid(token) : false;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/projects");
  const isApiProtectedRoute = pathname.startsWith("/api/dashboard") || pathname.startsWith("/api/projects") || pathname.startsWith("/api/tasks");

  if (isProtectedRoute && !authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isApiProtectedRoute && !authenticated) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (isAuthRoute && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/login",
    "/signup",
    "/api/dashboard/:path*",
    "/api/projects/:path*",
    "/api/tasks/:path*",
  ],
};
