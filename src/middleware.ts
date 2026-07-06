import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

let lastCleanup = Date.now();

function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();

  if (now - lastCleanup > 60_000) {
    cleanup();
    lastCleanup = now;
  }

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

const protectedRoutes = ["/dashboard", "/admin", "/profile", "/notifications", "/directory", "/forums"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const limit = 100;
    const windowMs = 60_000;
    const key = `api:${ip}`;
    const result = checkRateLimit(key, limit, windowMs);

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }
  }

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtected) {
    const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
    const isSecure = request.nextUrl.protocol === "https:";

    const token = await getToken({
      req: request,
      secret,
      secureCookie: isSecure,
    });

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/notifications/:path*",
    "/directory/:path*",
    "/onboarding/:path*",
    "/pending",
    "/forums/:path*",
  ],
};
