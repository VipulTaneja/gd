import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-2xl font-bold">Events</h1>
          <Link href="/events/new"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light w-full sm:w-auto">
            Create Event
          </Link>
        </div>

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
                  {rsvp && (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      rsvp === "ACCEPTED" ? "bg-green-100 text-green-800" :
                      rsvp === "DECLINED" ? "bg-red-100 text-red-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {rsvp}
                    </span>
                  )}
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
          {events.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No upcoming events.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
