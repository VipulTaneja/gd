import { db } from "@/lib/db";
import { GateValidation } from "@/components/visitors/gate-validation";

export const dynamic = "force-dynamic";

async function getTodayStaff() {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  return db.visitorPass.findMany({
    where: {
      visitorType: "DAILY_HELP",
      status: "ACTIVE",
      validFrom: { lte: endOfDay },
      validUntil: { gte: startOfDay },
    },
    include: {
      unit: { select: { unitNumber: true, block: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export default async function GatePage() {
  const staff = await getTodayStaff();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <h1 className="font-heading text-2xl font-bold">Gate Control</h1>

        {staff.length > 0 && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">
              Today&apos;s Expected Staff ({staff.length})
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {staff.map((pass) => (
                <div key={pass.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold text-xs font-bold">
                    {pass.visitorName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{pass.visitorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {pass.unit.unitNumber} · {pass.unit.block}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {pass.validFrom.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <GateValidation />
      </div>
    </div>
  );
}
