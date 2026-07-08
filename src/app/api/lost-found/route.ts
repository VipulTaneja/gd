import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, type, location } = await request.json();

  if (!title || !type) {
    return NextResponse.json({ error: "Title and type are required" }, { status: 400 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const item = await db.lostFoundItem.create({
    data: {
      userId: session.user.id,
      title,
      description: description || null,
      type,
      location: location || null,
      expiresAt,
    },
  });

  return NextResponse.json({ success: true, id: item.id });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: "ACTIVE", expiresAt: { gt: new Date() } };
  if (type) where.type = type;

  const items = await db.lostFoundItem.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(items);
}
