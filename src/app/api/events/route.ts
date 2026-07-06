import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { createBulkNotifications } from "@/lib/notifications";
import { richTextToPlain, sanitizeRichText } from "@/lib/rich-text";
import {
  buildSubCommunityContentFilter,
  canCreateGlobalEventOrPoll,
  canCreateScopedEventOrPoll,
  getCommunityMemberUserIds,
} from "@/lib/community-leaders";
import { canApproveFacilityBooking } from "@/lib/rbac-leaders";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const upcoming = searchParams.get("upcoming") !== "false";

  const scopeFilter = await buildSubCommunityContentFilter(session.user.id);

  const events = await db.event.findMany({
    where: {
      ...scopeFilter,
      ...(upcoming ? { startsAt: { gte: new Date() } } : {}),
    },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      scope: true,
      subCommunityId: true,
      facilityId: true,
      startsAt: true,
      endsAt: true,
      maxAttendees: true,
      createdAt: true,
    },
  });

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const body = await request.json();
  const { title, description, location, startsAt, endsAt, scope, subCommunityId, maxAttendees, facilityId } = body;

  if (!title || !startsAt || !endsAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const eventScope = scope || "GLOBAL";

  if (eventScope === "SUB_COMMUNITY") {
    if (!subCommunityId) {
      return NextResponse.json({ error: "subCommunityId required for community events" }, { status: 400 });
    }
    const community = await db.subCommunity.findUnique({
      where: { id: subCommunityId },
      select: { id: true, isArchived: true },
    });
    if (!community || community.isArchived) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }
    if (!(await canCreateScopedEventOrPoll(userId, subCommunityId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (!(await canCreateGlobalEventOrPoll(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sanitizedDescription =
    typeof description === "string" && description.trim()
      ? sanitizeRichText(description)
      : null;

  let linkedFacility: { id: string; name: string; requiresApproval: boolean; capacity: number } | null = null;
  if (facilityId) {
    linkedFacility = await db.facility.findUnique({
      where: { id: facilityId },
      select: { id: true, name: true, requiresApproval: true, capacity: true },
    });
    if (!linkedFacility) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    const eventStart = new Date(startsAt);
    const eventEnd = new Date(endsAt);

    const overlappingBlackout = await db.facilityBlackout.findFirst({
      where: {
        facilityId,
        startsAt: { lt: eventEnd },
        endsAt: { gt: eventStart },
      },
    });
    if (overlappingBlackout) {
      return NextResponse.json({ error: "Facility unavailable during this time" }, { status: 400 });
    }

    const overlappingBookings = await db.facilityBooking.count({
      where: {
        facilityId,
        startsAt: { lt: eventEnd },
        endsAt: { gt: eventStart },
        status: { in: ["CONFIRMED", "PENDING_APPROVAL"] },
      },
    });
    if (overlappingBookings >= linkedFacility.capacity) {
      return NextResponse.json({ error: "Facility slot is not available" }, { status: 400 });
    }
  }

  const event = await db.event.create({
    data: {
      title,
      description: sanitizedDescription,
      location,
      scope: eventScope,
      subCommunityId: eventScope === "SUB_COMMUNITY" ? subCommunityId : null,
      facilityId: linkedFacility?.id ?? null,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      maxAttendees: maxAttendees || null,
      createdById: userId,
    },
  });

  if (linkedFacility) {
    const canAutoApprove =
      !linkedFacility.requiresApproval ||
      (await canApproveFacilityBooking(userId, linkedFacility.id));
    const bookingStatus = canAutoApprove ? "CONFIRMED" : "PENDING_APPROVAL";

    await db.facilityBooking.create({
      data: {
        facilityId: linkedFacility.id,
        userId,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        status: bookingStatus,
        ...(bookingStatus === "CONFIRMED"
          ? { reviewedById: userId, reviewedAt: new Date() }
          : {}),
      },
    });

    await logAction(userId, "EVENT_FACILITY_BOOKING_LINKED", "Event", event.id, {
      facilityId: linkedFacility.id,
      bookingStatus,
    });
  }

  await logAction(userId, "EVENT_CREATED", "Event", event.id, { title, scope: eventScope, subCommunityId, facilityId: linkedFacility?.id });

  const recipientIds =
    eventScope === "SUB_COMMUNITY" && subCommunityId
      ? await getCommunityMemberUserIds(subCommunityId)
      : (
          await db.user.findMany({
            where: { isActive: true, approvalStatus: "APPROVED" },
            select: { id: true },
          })
        ).map((r) => r.id);

  await createBulkNotifications(
    recipientIds,
    "NEW_EVENT",
    `New event: ${title}`,
    sanitizedDescription ? richTextToPlain(sanitizedDescription) : undefined,
    `/events/${event.id}`,
  );

  return NextResponse.json({ success: true, id: event.id });
}
