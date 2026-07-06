import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { EventForm } from "@/components/events/event-form";
import { isCommunityLeader } from "@/lib/rbac-leaders";
import { isAdmin } from "@/lib/rbac";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ communityId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const communityId = params.communityId;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  let community: { id: string; name: string } | null = null;
  if (communityId) {
    community = await db.subCommunity.findUnique({
      where: { id: communityId, isArchived: false },
      select: { id: true, name: true },
    });
    if (!community) notFound();

    const canCreate =
      (await isAdmin(session.user.id)) ||
      (await isCommunityLeader(session.user.id, communityId));
    if (!canCreate) redirect(`/communities/${communityId}`);
  } else if (!(await isAdmin(session.user.id))) {
    redirect("/events");
  }

  const facilities = await db.facility.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-2xl space-y-6">
        {community && (
          <Link
            href={`/communities/${community.id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {community.name}
          </Link>
        )}
        <h1 className="font-heading text-2xl font-bold">
          {community ? `Create event for ${community.name}` : "Create Event"}
        </h1>
        <div className="rounded-xl border bg-card p-6">
          <EventForm communityId={community?.id} facilities={facilities} />
        </div>
      </div>
    </DashboardLayout>
  );
}
