import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/rbac";
import { requireApprovedResident } from "@/lib/staff-auth";
import { isContactReviewable, listContactReviews } from "@/lib/contact-reviews";

const reviewLimits = new Map<string, { count: number; resetAt: number }>();

function checkReviewRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = reviewLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    reviewLimits.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: contactId } = await params;
  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10));

  const contact = await db.importantContact.findUnique({ where: { id: contactId } });
  if (!contact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = await listContactReviews(contactId, page);

  const ownReview = await db.contactReview.findUnique({
    where: {
      contactId_authorId: { contactId, authorId: session.user.id },
    },
  });

  return NextResponse.json({ ...data, ownReview });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const approved = await requireApprovedResident(session.user.id);
  if (!approved) {
    return NextResponse.json({ error: "Approval required" }, { status: 403 });
  }

  if (!checkReviewRateLimit(session.user.id)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id: contactId } = await params;
  const { rating, comment } = await request.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  const contact = await db.importantContact.findUnique({ where: { id: contactId } });
  if (!contact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!isContactReviewable(contact.category)) {
    return NextResponse.json({ error: "This contact is not reviewable" }, { status: 403 });
  }

  const review = await db.contactReview.upsert({
    where: {
      contactId_authorId: { contactId, authorId: session.user.id },
    },
    create: {
      contactId,
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
  ctx: { params: Promise<{ id: string }> },
) {
  return POST(request, ctx);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const approved = await requireApprovedResident(session.user.id);
  if (!approved) {
    return NextResponse.json({ error: "Approval required" }, { status: 403 });
  }

  const { id: contactId } = await params;

  await db.contactReview.deleteMany({
    where: { contactId, authorId: session.user.id },
  });

  return NextResponse.json({ success: true });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: contactId } = await params;
  const { isHidden } = await request.json();

  if (!(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reviewId } = await request.json();
  if (!reviewId) {
    return NextResponse.json({ error: "reviewId required" }, { status: 400 });
  }

  await db.contactReview.update({
    where: { id: reviewId, contactId },
    data: { isHidden: !!isHidden },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: isHidden ? "CONTACT_REVIEW_HIDDEN" : "CONTACT_REVIEW_UNHIDDEN",
      entityType: "ContactReview",
      entityId: reviewId,
    },
  });

  return NextResponse.json({ success: true });
}
