import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";
import { CommunityForm } from "./community-form";
import { ArchiveCommunityButton } from "./archive-button";
import { JoinRequestRow } from "./join-request-row";

export const dynamic = "force-dynamic";

export default async function AdminCommunitiesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const communities = await db.subCommunity.findMany({
    where: { isArchived: false },
    include: { _count: { select: { memberships: true, polls: true, events: true } } },
    orderBy: { name: "asc" },
  });

  const pendingRequests = await db.communityJoinRequest.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { id: true, name: true, email: true } }, subCommunity: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold">Communities</h1>
        </div>

        {/* Create new community */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Create Community</h2>
          <CommunityForm />
        </div>

        {/* Pending join requests */}
        {pendingRequests.length > 0 && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">
              Pending Join Requests ({pendingRequests.length})
            </h2>
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <JoinRequestRow key={req.id} request={req} />
              ))}
            </div>
          </div>
        )}

        {/* Community list */}
        <div className="rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Members</th>
                  <th className="px-4 py-3 text-left font-medium">Polls</th>
                  <th className="px-4 py-3 text-left font-medium">Events</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {communities.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/admin/communities/${c.id}`} className="font-medium text-gold hover:underline">
                        {c.name}
                      </Link>
                      {c.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{c.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">{c._count.memberships}</td>
                    <td className="px-4 py-3">{c._count.polls}</td>
                    <td className="px-4 py-3">{c._count.events}</td>
                    <td className="px-4 py-3 text-right">
                      <ArchiveCommunityButton communityId={c.id} />
                    </td>
                  </tr>
                ))}
                {communities.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      No communities yet. Create one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
