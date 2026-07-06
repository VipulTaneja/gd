import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export const dynamic = "force-dynamic";

async function getFacilityAnalytics() {
  const facilities = await db.facility.findMany({
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        select: { startsAt: true, endsAt: true },
        orderBy: { startsAt: "desc" },
        take: 100,
      },
    },
  });

  return facilities.map((f) => {
    const hourlyDistribution = new Array(24).fill(0);
    f.bookings.forEach((b) => {
      const hour = new Date(b.startsAt).getHours();
      hourlyDistribution[hour]++;
    });

    const peakHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));

    return {
      id: f.id,
      name: f.name,
      totalBookings: f._count.bookings,
      peakHour: peakHour >= 0 ? `${peakHour}:00 - ${peakHour + 1}:00` : "No data",
      hourlyDistribution,
    };
  });
}

export default async function AdminFacilityAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const analytics = await getFacilityAnalytics();

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Facility Analytics" }]} />

      <h1 className="font-heading text-2xl font-bold">Facility Usage Analytics</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {analytics.map((facility) => (
          <div key={facility.id} className="rounded-xl border bg-card p-6">
            <h3 className="font-heading text-lg font-semibold">{facility.name}</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Bookings</span>
                <span className="font-medium">{facility.totalBookings}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Peak Hours</span>
                <span className="font-medium">{facility.peakHour}</span>
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Hourly Distribution</p>
                <div className="flex items-end gap-0.5 h-16">
                  {facility.hourlyDistribution.slice(6, 22).map((count, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gold/20 rounded-t"
                      style={{ height: `${Math.max((count / Math.max(...facility.hourlyDistribution, 1)) * 100, 2)}%` }}
                      title={`${i + 6}:00 - ${count} bookings`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>6 AM</span>
                  <span>10 PM</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
