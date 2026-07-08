import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getApprovedResident } from "@/lib/staff-auth";
import { listStaffReviews } from "@/lib/staff";
import { checkUserRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { approvalRequiredResponse, unauthorizedResponse } from "@/lib/api-errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: staffPersonId } = await params;
  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10));

  const person = await db.staffPerson.findUnique({ where: { id: staffPersonId } });
  if (!person) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { reviews, total, pageSize } = await listStaffReviews(staffPersonId, page);

  const ownReview = await db.staffReview.findUnique({
    where: {
      staffPersonId_authorId: { staffPersonId, authorId: session.user.id },
    },
  });

  return NextResponse.json({ reviews, total, page, pageSize, ownReview });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

  const approved = await getApprovedResident(session.user.id);
  if (!approved) {
    return approvalRequiredResponse();
  }

  const rl = checkUserRateLimit(session.user.id, "staff-review", 10, 60_000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfterMs);

  const { id: staffPersonId } = await params;
  const { rating, comment } = await request.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  const person = await db.staffPerson.findUnique({
    where: { id: staffPersonId },
    include: { associations: { take: 1 } },
  });
  if (!person) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (person.associations.length === 0) {
    return NextResponse.json({ error: "Staff has no associations" }, { status: 403 });
  }

  const review = await db.staffReview.upsert({
    where: {
      staffPersonId_authorId: { staffPersonId, authorId: session.user.id },
    },
    create: {
      staffPersonId,
      authorId: session.user.id,
      rating,
      comment: comment?.slice(0, 500) ?? null,
    },
    update: {
      rating,
      comment: comment?.slice(0, 500) ?? null,
    },
  });

  return NextResponse.json({ success: true, review });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return POST(request, { params });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const approved = await getApprovedResident(session.user.id);
  if (!approved) {
    return NextResponse.json({ error: "Approval required" }, { status: 403 });
  }

  const { id: staffPersonId } = await params;

  await db.staffReview.deleteMany({
    where: { staffPersonId, authorId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
