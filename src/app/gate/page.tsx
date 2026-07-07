import { GateValidation } from "@/components/visitors/gate-validation";
import { getTodayStaffPasses } from "@/lib/staff-passes";
import { UnitLink } from "@/components/shared/unit-link";
import { staff as staffCopy } from "@/lib/microcopy";

export const dynamic = "force-dynamic";

export default async function GatePage() {
  const passes = await getTodayStaffPasses();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <h1 className="font-heading text-2xl font-bold">Gate Control</h1>

        {passes.length > 0 && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">
              {staffCopy.expectedToday} ({passes.length})
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {passes.map((pass) => {
                const unitNumbers =
                  pass.staffPerson?.associations
                    .map((a) => a.unit?.unitNumber)
                    .filter((n): n is string => !!n) ??
                  (pass.unit?.unitNumber ? [pass.unit.unitNumber] : []);

                return (
                  <div key={pass.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold text-xs font-bold">
                      {pass.visitorName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{pass.visitorName}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {unitNumbers.map((unit) => (
                          <UnitLink key={unit} unitNumber={unit} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {pass.validFrom.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <GateValidation />
      </div>
    </div>
  );
}
