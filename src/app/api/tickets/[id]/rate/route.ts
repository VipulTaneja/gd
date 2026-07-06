import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { rating, comment } = await request.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const ticket = await db.helpTicket.findUnique({ where: { id } });
  if (!ticket || ticket.userId !== session.user.id) {
    return NextResponse.json({ error: "Ticket not found or unauthorized" }, { status: 404 });
  }

  if (ticket.status !== "CLOSED" && ticket.status !== "RESOLVED") {
    return NextResponse.json({ error: "Can only rate closed tickets" }, { status: 400 });
  }

  await db.helpTicket.update({
    where: { id },
    data: {
      satisfactionRating: rating,
      satisfactionComment: comment || null,
    },
  });

  return NextResponse.json({ success: true });
}
