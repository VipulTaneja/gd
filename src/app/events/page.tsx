import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { actions, empty } from "@/lib/microcopy";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const events = await db.event.findMany({
    where: { startsAt: { gte: new Date() } },
    include: {
      _count: { select: { rsvps: true } },
      rsvps: { where: { userId: session.user.id }, select: { status: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="events"
          title="Events"
          subtitle="Community gatherings and activities"
          action={
            <Link href="/events/new"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light w-full sm:w-auto">
              {actions.newEvent}
            </Link>
          }
        />

        {events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={empty.events.title}
            description={empty.events.description}
            action={{ label: actions.newEvent, href: "/events/new" }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const rsvp = event.rsvps[0]?.status;
              return (
                <Link key={event.id} href={`/events/${event.id}`}
                  className="group rounded-xl border bg-card p-5 transition-all hover:ring-gold hover:shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="rounded-lg bg-gold/10 px-3 py-1 text-center">
                      <p className="text-xs text-gold font-medium">
                        {event.startsAt.toLocaleDateString("en-IN", { month: "short" })}
                      </p>
                      <p className="font-heading text-xl font-bold text-gold">
                        {event.startsAt.getDate()}
                      </p>
                    </div>
                    {rsvp && <FriendlyBadge value={rsvp} variant="status" />}
                  </div>
                  <h3 className="font-heading text-base font-semibold group-hover:text-gold">{event.title}</h3>
                  {event.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {event.startsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {event._count.rsvps}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
