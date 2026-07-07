import Link from "next/link";
import { getStaffForUnits, staffRoleLabel } from "@/lib/staff";
import { StaffLink } from "@/components/staff/staff-link";
import { SoftCard } from "@/components/shared/soft-card";
import { Users } from "lucide-react";

export async function UnitHouseholdStaff({ unitId }: { unitId: string }) {
  const associations = await getStaffForUnits([unitId]);
  if (associations.length === 0) return null;

  return (
    <SoftCard accent="gold" className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          Regular help
        </h3>
        <Link href="/staff" className="text-sm text-gold hover:underline">
          Manage
        </Link>
      </div>
      <ul className="space-y-2">
        {associations.map((a) => (
          <li key={a.id} className="text-sm flex justify-between gap-2">
            <StaffLink staffId={a.staffPerson.id} name={a.staffPerson.name} />
            <span className="text-muted-foreground shrink-0">{staffRoleLabel(a.role)}</span>
          </li>
        ))}
      </ul>
    </SoftCard>
  );
}
