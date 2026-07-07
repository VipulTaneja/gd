import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getContactReviewAggregate,
  isContactReviewable,
} from "@/lib/contact-reviews";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const contact = await db.importantContact.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      lastEditedBy: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  if (!contact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const aggregate = await getContactReviewAggregate(id);

  return NextResponse.json({
    contact: {
      id: contact.id,
      category: contact.category,
      typeOfService: contact.typeOfService,
      name: contact.name,
      contactNo: contact.contactNo,
      remarks: contact.remarks,
      lastEditedAt: contact.lastEditedAt,
      createdBy: contact.createdBy,
      lastEditedBy: contact.lastEditedBy,
    },
    avgRating: aggregate.avgRating,
    reviewCount: aggregate.reviewCount,
    reviewable: isContactReviewable(contact.category),
  });
}
