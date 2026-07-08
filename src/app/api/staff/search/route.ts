import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getApprovedResident } from "@/lib/staff-auth";
import { getStaffReviewAggregates, searchStaffPersons } from "@/lib/staff";
import { checkUserRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { approvalRequiredResponse, unauthorizedResponse } from "@/lib/api-errors";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

  const approved = await getApprovedResident(session.user.id);
  if (!approved) {
    return approvalRequiredResponse();
  }

  const rl = checkUserRateLimit(session.user.id, "staff-search", 30, 60_000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfterMs);

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 && q.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ results: [] });
  }

  try {
    const people = await searchStaffPersons(q);
    const aggregates = await getStaffReviewAggregates(people.map((p) => p.id));

    const results = people.map((p) => ({
      id: p.id,
      name: p.name,
      roles: p.associations.map((a) => a.role),
      units: p.associations.map((a) => a.unit?.unitNumber).filter(Boolean),
      avgRating: aggregates.get(p.id)?.avgRating ?? null,
      reviewCount: aggregates.get(p.id)?.reviewCount ?? 0,
    }));

    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Search failed" },
      { status: 500 },
    );
  }
}
