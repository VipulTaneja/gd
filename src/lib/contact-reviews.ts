import { db } from "@/lib/db";
import { isValidContactCategory } from "@/lib/contact-category-style";

export const NON_REVIEWABLE_CATEGORY = "Internal Intercom";

export { isValidContactCategory };

export function isContactReviewable(category: string): boolean {
  return category !== NON_REVIEWABLE_CATEGORY;
}

export async function getContactReviewAggregate(contactId: string) {
  const reviews = await db.contactReview.findMany({
    where: { contactId, isHidden: false },
    select: { rating: true },
  });
  if (reviews.length === 0) return { avgRating: null, reviewCount: 0 };
  const sum = reviews.reduce((a, r) => a + r.rating, 0);
  return {
    avgRating: Math.round((sum / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  };
}

export async function getContactReviewAggregates(contactIds: string[]) {
  if (contactIds.length === 0) return new Map<string, { avgRating: number | null; reviewCount: number }>();

  const rows = await db.contactReview.groupBy({
    by: ["contactId"],
    where: { contactId: { in: contactIds }, isHidden: false },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const map = new Map<string, { avgRating: number | null; reviewCount: number }>();
  for (const id of contactIds) {
    map.set(id, { avgRating: null, reviewCount: 0 });
  }
  for (const row of rows) {
    map.set(row.contactId, {
      avgRating: row._avg.rating != null ? Math.round(row._avg.rating * 10) / 10 : null,
      reviewCount: row._count.rating,
    });
  }
  return map;
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
