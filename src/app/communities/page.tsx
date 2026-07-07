import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";
import { Users, Calendar, MessageSquare } from "lucide-react";
import { syncTowerCommunitiesForUser } from "@/lib/tower-communities";

export const dynamic = "force-dynamic";

export default async function CommunitiesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  await syncTowerCommunitiesForUser(session.user.id);

  const communities = await db.subCommunity.findMany({
    where: { isArchived: false },
    include: {
      _count: { select: { memberships: true, polls: true, events: true } },
      memberships: {
        where: { userId: session.user.id },
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Teams and Communities</h1>
          <p className="text-muted-foreground">Browse teams and join communities in your neighbourhood.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((c) => {
            const isMember = c.memberships.length > 0;
            return (
              <Link
                key={c.id}
                href={`/communities/${c.id}`}
                className="group rounded-xl border bg-card p-6 transition-all hover:ring-gold hover:shadow-lg"
              >
                <h3 className="font-heading text-lg font-semibold group-hover:text-gold">
                  {c.name}
                </h3>
                {c.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {c._count.memberships}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {c._count.polls}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {c._count.events}
                  </span>
                </div>
                {isMember ? (
                  <span className="mt-4 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    Member
                  </span>
                ) : (
                  <span className="mt-4 inline-flex items-center rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                    View →
                  </span>
                )}
              </Link>
            );
          })}
          {communities.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No communities available yet.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
