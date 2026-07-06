import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ticketId, body } = await request.json();

  if (!ticketId || !body) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const comment = await db.ticketComment.create({
    data: {
      ticketId,
      authorId: session.user!.id,
      body,
    },
  });

  return NextResponse.json({ success: true, id: comment.id });
}
