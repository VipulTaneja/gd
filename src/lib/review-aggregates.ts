export type ReviewAggregateResult = { avgRating: number | null; reviewCount: number };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReviewModel = { findMany: (...args: any[]) => any; groupBy: (...args: any[]) => any };

export async function getReviewAggregate(
  model: ReviewModel,
  entityIdField: string,
  entityId: string,
): Promise<ReviewAggregateResult> {
  const reviews = await model.findMany({
    where: { [entityIdField]: entityId, isHidden: false },
    select: { rating: true },
  });
  if (reviews.length === 0) return { avgRating: null, reviewCount: 0 };
  const sum = reviews.reduce((a: number, r: { rating: number }) => a + r.rating, 0);
  return {
    avgRating: Math.round((sum / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  };
}

export async function getReviewAggregates(
  model: ReviewModel,
  entityIdField: string,
  entityIds: string[],
): Promise<Map<string, ReviewAggregateResult>> {
  if (entityIds.length === 0) return new Map<string, ReviewAggregateResult>();

  const rows = await model.groupBy({
    by: [entityIdField],
    where: { [entityIdField]: { in: entityIds }, isHidden: false },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const map = new Map<string, ReviewAggregateResult>();
  for (const id of entityIds) {
    map.set(id, { avgRating: null, reviewCount: 0 });
  }
  for (const row of rows) {
    const avg = row._avg as { rating: number | null };
    const cnt = row._count as { rating: number };
    map.set(row[entityIdField] as string, {
      avgRating: avg.rating != null ? Math.round(avg.rating * 10) / 10 : null,
      reviewCount: cnt.rating,
    });
  }
  return map;
}
