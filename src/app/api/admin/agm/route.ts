import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, isAdminApiError } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { createBulkNotifications } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const admin = await requireAdminApi();
  if (isAdminApiError(admin)) return admin;

  const { title, description, startsAt, endsAt, location, resolutions } = await request.json();

  if (!title || !startsAt || !endsAt) {
    return NextResponse.json({ error: "Title, start, and end times are required" }, { status: 400 });
  }

  const event = await db.event.create({
    data: {
      title,
      description: description || null,
      location: location || null,
      scope: "GLOBAL",
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      createdById: admin.userId,
    },
  });

  const polls = [];
  for (const resolution of resolutions) {
    if (!resolution.trim()) continue;
    const poll = await db.poll.create({
      data: {
        title: resolution,
        scope: "GLOBAL",
        isResolution: true,
        eligibility: "OWNERS_ONLY",
        opensAt: new Date(startsAt),
        closesAt: new Date(endsAt),
        createdById: admin.userId,
        options: {
          create: [
            { label: "Yes", order: 0 },
            { label: "No", order: 1 },
          ],
        },
      },
    });
    polls.push(poll);
  }

  const residents = await db.user.findMany({
    where: { isActive: true, approvalStatus: "APPROVED" },
    select: { id: true },
  });

  await createBulkNotifications(
    residents.map((r) => r.id),
    "NEW_EVENT",
    `AGM Scheduled: ${title}`,
    `The Annual General Meeting has been scheduled for ${new Date(startsAt).toLocaleDateString("en-IN")}. ${polls.length} resolution(s) will be voted on.`,
    `/events/${event.id}`
  );

  return NextResponse.json({ success: true, eventId: event.id, pollCount: polls.length });
}
