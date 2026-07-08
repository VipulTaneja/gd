import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { UserLink } from "@/components/shared/user-link";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { ApproveMoveButton, RejectMoveButton, CompleteMoveButton } from "./buttons";

export const dynamic = "force-dynamic";

export default async function AdminMovesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const moves = await db.moveRequest.findMany({
    include: {
      unit: { select: { unitNumber: true, block: true } },
      requester: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Move Requests" }]} />

      <h1 className="font-heading text-2xl font-bold">Move Requests</h1>

      <div className="md:hidden space-y-3">
        {moves.length === 0 && (
          <div className="rounded-xl border bg-card px-4 py-12 text-center text-muted-foreground">
            No move requests.
          </div>
        )}
        {moves.map((move) => (
          <div key={move.id} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{move.type.replace("_", " ")}</p>
                <p className="text-sm text-muted-foreground">{move.unit.unitNumber}</p>
              </div>
              <AdminStatusBadge value={move.status} />
            </div>
            <div className="text-sm">
              <UserLink userId={move.requester.id} name={move.requester.name} />
              <p className="text-muted-foreground">{move.requester.email}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {move.createdAt.toLocaleDateString()}
            </div>
            <div className="flex justify-end gap-2">
              {move.status === "PENDING" && (
                <>
                  <ApproveMoveButton moveId={move.id} />
                  <RejectMoveButton moveId={move.id} />
                </>
              )}
              {move.status === "APPROVED" && (
                <CompleteMoveButton moveId={move.id} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Unit</th>
                <th className="px-4 py-3 text-left font-medium">Requested By</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((move) => (
                <tr key={move.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{move.type.replace("_", " ")}</td>
                  <td className="px-4 py-3">{move.unit.unitNumber}</td>
                  <td className="px-4 py-3">
                    <UserLink userId={move.requester.id} name={move.requester.name} />
                    <p className="text-xs text-muted-foreground">{move.requester.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge value={move.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {move.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {move.status === "PENDING" && (
                        <>
                          <ApproveMoveButton moveId={move.id} />
                          <RejectMoveButton moveId={move.id} />
                        </>
                      )}
                      {move.status === "APPROVED" && (
                        <CompleteMoveButton moveId={move.id} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {moves.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No move requests.
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
