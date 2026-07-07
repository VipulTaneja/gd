import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStaffProfile, getStaffReviewAggregate, staffRoleLabel } from "@/lib/staff";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const profile = await getStaffProfile(id);
    if (!profile) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const aggregate = await getStaffReviewAggregate(id);
    const now = new Date();

    const activeAssociations = profile.associations.filter(
      (a) =>
        a.status === "ACTIVE" &&
        (!a.endDate || a.endDate > now),
    );
    const endedAssociations = profile.associations.filter(
      (a) => a.status === "ENDED" || (a.endDate && a.endDate <= now),
    );

    return NextResponse.json({
      id: profile.id,
      name: profile.name,
      photoUrl: profile.photoUrl,
      avgRating: aggregate.avgRating,
      reviewCount: aggregate.reviewCount,
      activeAssociations: activeAssociations.map((a) => ({
        id: a.id,
        role: a.role,
        roleLabel: staffRoleLabel(a.role),
        unitNumber: a.unit?.unitNumber ?? null,
        recurrenceDays: a.recurrenceDays,
        scope: a.scope,
      })),
      endedAssociations: endedAssociations.map((a) => ({
        id: a.id,
        role: a.role,
        roleLabel: staffRoleLabel(a.role),
        unitNumber: a.unit?.unitNumber ?? null,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}
