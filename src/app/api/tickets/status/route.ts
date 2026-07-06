import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ticketId, status, assignedToUserId } = await request.json();

  const update: Record<string, unknown> = {};
  if (status) {
    update.status = status;
    if (status === "RESOLVED") update.resolvedAt = new Date();
  }
  if (assignedToUserId !== undefined) update.assignedToUserId = assignedToUserId;

  const ticket = await db.helpTicket.update({
    where: { id: ticketId },
    data: update,
  });

  if (status && ticket.userId !== session.user!.id) {
    await createNotification(
      ticket.userId,
      "TICKET_UPDATE",
      "Ticket Updated",
      `Your ticket "${ticket.subject}" status changed to ${status}`,
      `/tickets/${ticketId}`,
    );
  }

  if (assignedToUserId && assignedToUserId !== session.user!.id) {
    await createNotification(
      assignedToUserId,
      "TICKET_UPDATE",
      "Ticket Assigned",
      `You have been assigned to ticket "${ticket.subject}"`,
      `/tickets/${ticketId}`,
    );
  }

  return NextResponse.json({ success: true });
}
