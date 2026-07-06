import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SignJWT } from "jose";

export async function POST(request: NextRequest) {
  const { pin } = await request.json();

  if (!pin || pin.length < 4) {
    return NextResponse.json({ error: "PIN must be at least 4 digits" }, { status: 400 });
  }

  const user = await db.user.findFirst({
    where: {
      staffPin: pin,
      globalRole: "SECURITY_STAFF",
      isActive: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    globalRole: "SECURITY_STAFF",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const response = NextResponse.json({ success: true });
  response.cookies.set("gate-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}
