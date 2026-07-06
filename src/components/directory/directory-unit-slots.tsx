import { UnitLink } from "@/components/shared/unit-link";
import { ResidentBalloon } from "@/components/directory/resident-balloon";
import { VacantUnitBalloon } from "@/components/directory/vacant-unit-balloon";
import { pickUnitSlot, type DirectoryUnitSlot } from "@/lib/directory-layout";

interface DirectoryUnitSlotsProps {
  units: DirectoryUnitSlot[];
}

function UnitColumn({
  slot,
  align,
}: {
  slot: DirectoryUnitSlot | null;
  align: "left" | "right";
}) {
  if (!slot) {
    return <span className="text-xs text-muted-foreground/50 italic">—</span>;
  }

  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <UnitLink
        unitNumber={slot.unitNumber}
        className={`mb-0.5 inline-flex text-[10px] ${align === "right" ? "ml-auto" : ""}`}
      />
      {slot.isVacant ? (
        <div className={align === "right" ? "flex justify-end" : "flex justify-start"}>
          <VacantUnitBalloon block={slot.block} />
        </div>
      ) : (
        <div
          className={`flex flex-wrap gap-1 ${align === "right" ? "justify-end" : "justify-start"}`}
        >
          {slot.residents.map((resident) => (
            <ResidentBalloon key={resident.id} resident={resident} />
          ))}
        </div>
      )}
    </div>
  );
}

export function DirectoryUnitSlots({ units }: DirectoryUnitSlotsProps) {
  if (units.length === 0) {
    return <span className="text-xs text-muted-foreground/60 italic">—</span>;
  }

  const unit2 = pickUnitSlot(units, 2);
  const unit1 = pickUnitSlot(units, 1);

  return (
    <div className="grid grid-cols-2 gap-1">
      <UnitColumn slot={unit1} align="left" />
      <UnitColumn slot={unit2} align="right" />
    </div>
  );
}
