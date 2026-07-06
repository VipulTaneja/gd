import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateRichTextBody } from "@/lib/rich-text";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user!.id;
  const { category, priority, subject, description } = await request.json();

  if (!category || !subject) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const parsedDescription = validateRichTextBody(description);
  if (!parsedDescription.ok) {
    return NextResponse.json({ error: parsedDescription.error }, { status: 400 });
  }

  const membership = await db.unitMembership.findFirst({
    where: { userId, OR: [{ endDate: null }, { endDate: { gt: new Date() } }] },
    select: { unitId: true },
  });

  const ticket = await db.helpTicket.create({
    data: {
      userId,
      unitId: membership?.unitId || null,
      category,
      priority: priority || "MEDIUM",
      subject,
      description: parsedDescription.html,
    },
  });

  return NextResponse.json({ success: true, id: ticket.id });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { userId: session.user!.id };
  if (status) where.status = status;

  const tickets = await db.helpTicket.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tickets);
}
