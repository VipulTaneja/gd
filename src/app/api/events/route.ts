import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { createBulkNotifications } from "@/lib/notifications";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, description, location, startsAt, endsAt, scope, subCommunityId, maxAttendees } = body;

  if (!title || !startsAt || !endsAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const event = await db.event.create({
    data: {
      title,
      description,
      location,
      scope: scope || "GLOBAL",
      subCommunityId: subCommunityId || null,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      maxAttendees: maxAttendees || null,
      createdById: session.user.id,
    },
  });

  await logAction(session.user.id, "EVENT_CREATED", "Event", event.id, { title, scope });

  // Notify all approved residents
  const residents = await db.user.findMany({
    where: { isActive: true, approvalStatus: "APPROVED" },
    select: { id: true },
  });
  await createBulkNotifications(
    residents.map((r) => r.id),
    "NEW_EVENT",
    `New event: ${title}`,
    description || undefined,
    `/events`
  );

  return NextResponse.json({ success: true, id: event.id });
}
