import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPresignedUploadUrl, generateFileKey } from "@/lib/minio";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename, mimeType, ticketId } = await request.json();

  if (!filename || !mimeType || !ticketId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const ticket = await db.helpTicket.findUnique({ where: { id: ticketId } });
  if (!ticket || ticket.userId !== session.user.id) {
    return NextResponse.json({ error: "Ticket not found or unauthorized" }, { status: 404 });
  }

  const key = generateFileKey(session.user.id, filename);
  const uploadUrl = await getPresignedUploadUrl(key);

  const attachment = await db.ticketAttachment.create({
    data: {
      ticketId,
      name: filename,
      mimeType,
      sizeBytes: 0,
      storageKey: key,
    },
  });

  return NextResponse.json({ uploadUrl, attachmentId: attachment.id, storageKey: key });
}
