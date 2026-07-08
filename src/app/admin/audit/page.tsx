import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserLink } from "@/components/shared/user-link";
import {
  LEADER_AUDIT_PRESETS,
  getLeaderAuditPresetActions,
} from "@/lib/audit-leader-presets";

export const dynamic = "force-dynamic";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entity?: string; preset?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const where: Record<string, unknown> = {};
  const presetActions = params.preset ? getLeaderAuditPresetActions(params.preset) : null;

  if (presetActions) {
    where.action = { in: presetActions };
  } else if (params.action) {
    where.action = params.action;
  }
  if (params.entity) where.entityType = params.entity;

  const logs = await db.auditLog.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const actions = await db.auditLog.findMany({
    select: { action: true },
    distinct: ["action"],
  });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Audit Log</h1>

      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/audit"
          className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
            !params.action && !params.entity && !params.preset
              ? "bg-primary text-primary-foreground"
              : "border border-input hover:bg-muted"
          }`}
        >
          All
        </a>
        {Object.entries(LEADER_AUDIT_PRESETS).map(([key, { label }]) => (
          <a
            key={key}
            href={`/admin/audit?preset=${key}`}
            className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-medium transition-colors ${
              params.preset === key
                ? "bg-primary text-primary-foreground"
                : "border border-input hover:bg-muted"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <a
            key={a.action}
            href={`/admin/audit?action=${a.action}`}
            className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-medium transition-colors ${
              params.action === a.action ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
            }`}
          >
            {a.action}
          </a>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Time</th>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
                <th className="px-4 py-3 text-left font-medium">Entity</th>
                <th className="px-4 py-3 text-left font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {log.createdAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <UserLink userId={log.user.id} name={log.user.name} className="font-medium" />
                    <p className="text-xs text-muted-foreground">{log.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.entityType}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">
                    {log.metadata ? JSON.stringify(log.metadata) : "—"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
