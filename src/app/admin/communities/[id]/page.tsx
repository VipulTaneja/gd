import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { UserLink } from "@/components/shared/user-link";
import Link from "next/link";
import { CommunityForm } from "../community-form";
import { AssignAdminForm } from "./assign-admin-form";

export const dynamic = "force-dynamic";

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const community = await db.subCommunity.findUnique({
    where: { id },
    include: {
      memberships: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: "desc" },
      },
      polls: { orderBy: { createdAt: "desc" }, take: 5 },
      events: { orderBy: { startsAt: "asc" }, take: 5 },
    },
  });

  if (!community) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/communities" className="text-sm text-muted-foreground hover:text-foreground">
        ← Communities
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold">{community.name}</h1>
        {community.description && (
          <p className="text-muted-foreground">{community.description}</p>
        )}
      </div>

      {/* Edit */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4">Edit Community</h2>
        <CommunityForm community={community} />
      </div>

      {/* Assign Admin */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4">Assign Community Admin</h2>
        <AssignAdminForm communityId={community.id} />
      </div>

      {/* Members */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4">
          Members ({community.memberships.length})
        </h2>
        <div className="space-y-2">
          {community.memberships.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <UserLink userId={m.user.id} name={m.user.name} className="font-medium" />
                <p className="text-xs text-muted-foreground">{m.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  m.role === "ADMIN" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {m.role}
                </span>
              </div>
            </div>
          ))}
          {community.memberships.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No members yet</p>
          )}
        </div>
      </div>

      {/* Recent Polls */}
      {community.polls.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Recent Polls</h2>
          <div className="space-y-2">
            {community.polls.map((p) => (
              <Link key={p.id} href={`/polls/${p.id}`} className="block rounded-lg border p-3 hover:bg-muted/50">
                <p className="font-medium text-sm">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.closesAt.toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Events */}
      {community.events.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-2">
            {community.events.map((e) => (
              <Link key={e.id} href={`/events/${e.id}`} className="block rounded-lg border p-3 hover:bg-muted/50">
                <p className="font-medium text-sm">{e.title}</p>
                <p className="text-xs text-muted-foreground">
                  {e.startsAt.toLocaleDateString()} · {e.location ?? "TBD"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
