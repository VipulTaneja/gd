import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireApprovedResident } from "@/lib/staff-auth";
import { getStaffReviewAggregates, searchStaffPersons } from "@/lib/staff";

const searchLimits = new Map<string, { count: number; resetAt: number }>();

function checkSearchRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = searchLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    searchLimits.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count++;
  return true;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const approved = await requireApprovedResident(session.user.id);
  if (!approved) {
    return NextResponse.json({ error: "Approval required" }, { status: 403 });
  }

  if (!checkSearchRateLimit(session.user.id)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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
