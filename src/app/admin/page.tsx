import { db } from "@/lib/db";
import { Users, Home, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalUsers, pendingUsers, totalUnits, openTickets, totalFacilities, totalCommittee] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { approvalStatus: "PENDING" } }),
    db.unit.count(),
    db.helpTicket.count({ where: { status: "OPEN" } }),
    db.facility.count(),
    db.designation.count({ where: { endDate: null } }),
  ]);

  const unitsWithMembers = await db.unit.count({
    where: { memberships: { some: { endDate: null } } },
  });

  const hasBylaws = await db.fileEntry.count({ where: { name: { contains: "bylaw", mode: "insensitive" } } });

  return { totalUsers, pendingUsers, totalUnits, openTickets, totalFacilities, totalCommittee, unitsWithMembers, hasBylaws };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Approvals",
      value: stats.pendingUsers,
      icon: AlertCircle,
      href: "/admin/users?filter=pending",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Units",
      value: stats.totalUnits,
      icon: Home,
      href: "/admin/units",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Open Tickets",
      value: stats.openTickets,
      icon: FileText,
      href: "/admin/tickets",
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="rounded-xl border bg-card p-6 transition-colors hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-1 font-heading text-3xl font-bold">{card.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-heading text-lg font-semibold">Quick Actions</h3>
          <div className="mt-4 space-y-3">
            <Link
              href="/admin/users?filter=pending"
              className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
            >
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Review pending user approvals
            </Link>
            <Link
              href="/admin/notices/new"
              className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
            >
              <FileText className="h-5 w-5 text-blue-500" />
              Publish a new notice
            </Link>
            <Link
              href="/admin/units"
              className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
            >
              <Home className="h-5 w-5 text-green-500" />
              Manage units and memberships
            </Link>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-heading text-lg font-semibold">Launch Readiness</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Units onboarded</span>
              <span className={`font-medium ${stats.unitsWithMembers >= stats.totalUnits ? "text-green-600" : "text-amber-600"}`}>
                {stats.unitsWithMembers}/{stats.totalUnits}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Facilities configured</span>
              <span className={`font-medium ${stats.totalFacilities >= 5 ? "text-green-600" : "text-amber-600"}`}>
                {stats.totalFacilities}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Committee members</span>
              <span className={`font-medium ${stats.totalCommittee >= 3 ? "text-green-600" : "text-amber-600"}`}>
                {stats.totalCommittee}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Bylaws uploaded</span>
              <span className={`font-medium ${stats.hasBylaws > 0 ? "text-green-600" : "text-amber-600"}`}>
                {stats.hasBylaws > 0 ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pending approvals</span>
              <span className={`font-medium ${stats.pendingUsers === 0 ? "text-green-600" : "text-amber-600"}`}>
                {stats.pendingUsers}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-heading text-lg font-semibold">Recent Activity</h3>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Activity log will appear here once admin actions are performed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
