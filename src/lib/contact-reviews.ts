import { db } from "@/lib/db";
import { isValidContactCategory } from "@/lib/contact-category-style";
import { getReviewAggregate, getReviewAggregates } from "@/lib/review-aggregates";

export const NON_REVIEWABLE_CATEGORY = "Internal Intercom";

export { isValidContactCategory };

export function isContactReviewable(category: string): boolean {
  return category !== NON_REVIEWABLE_CATEGORY;
}

export async function getContactReviewAggregate(contactId: string) {
  return getReviewAggregate(db.contactReview, "contactId", contactId);
}

export async function getContactReviewAggregates(contactIds: string[]) {
  return getReviewAggregates(db.contactReview, "contactId", contactIds);
}

export async function listContactReviews(contactId: string, page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;
  const [reviews, total] = await Promise.all([
    db.contactReview.findMany({
      where: { contactId, isHidden: false },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.contactReview.count({ where: { contactId, isHidden: false } }),
  ]);
  return { reviews, total, page, pageSize };
}
