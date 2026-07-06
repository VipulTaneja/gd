import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import { RsvpButtons } from "./rsvp-buttons";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const event = await db.event.findUnique({
    where: { id },
    include: {
      rsvps: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { rsvps: true } },
    },
  });

  if (!event) notFound();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const myRsvp = event.rsvps.find((r) => r.userId === session.user!.id);
  const isCreator = event.createdById === session.user!.id;
  const accepted = event.rsvps.filter((r) => r.status === "ACCEPTED");
  const declined = event.rsvps.filter((r) => r.status === "DECLINED");
  const maybe = event.rsvps.filter((r) => r.status === "MAYBE");

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground">← Events</Link>

        <div>
          <h1 className="font-heading text-2xl font-bold">{event.title}</h1>
          {event.description && <p className="mt-2 text-muted-foreground">{event.description}</p>}
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-5 w-5 text-gold" />
            <div>
              <p className="font-medium">
                {event.startsAt.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
              <p className="text-muted-foreground">
                {event.startsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} —{" "}
                {event.endsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          {event.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-5 w-5 text-gold" />
              <p>{event.location}</p>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Users className="h-5 w-5 text-gold" />
            <p>{event._count.rsvps} RSVP{event._count.rsvps !== 1 ? "s" : ""}</p>
            {event.maxAttendees && <span className="text-muted-foreground">/ {event.maxAttendees} max</span>}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Your RSVP</h2>
          <RsvpButtons eventId={event.id} currentStatus={myRsvp?.status ?? null} />
        </div>

        {(isCreator || ["SUPER_ADMIN", "ADMIN"].includes(user.globalRole)) && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">
              Attendees ({accepted.length} accepted, {maybe.length} maybe, {declined.length} declined)
            </h2>
            <div className="space-y-2">
              {accepted.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-600 mb-1">Accepted</p>
                  <div className="flex flex-wrap gap-2">
                    {accepted.map((r) => (
                      <span key={r.id} className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        {r.user.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {maybe.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-600 mb-1">Maybe</p>
                  <div className="flex flex-wrap gap-2">
                    {maybe.map((r) => (
                      <span key={r.id} className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        {r.user.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {declined.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-600 mb-1">Declined</p>
                  <div className="flex flex-wrap gap-2">
                    {declined.map((r) => (
                      <span key={r.id} className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                        {r.user.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
