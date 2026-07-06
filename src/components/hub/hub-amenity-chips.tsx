import Link from "next/link";
import { Building2, Waves, Dumbbell, TreePine } from "lucide-react";
import { FadeIn } from "@/components/shared/animated";
import type { HubFacility } from "@/types/hub";

interface HubAmenityChipsProps {
  facilities: HubFacility[];
}

function facilityIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("pool") || lower.includes("swim")) return Waves;
  if (lower.includes("gym") || lower.includes("fitness")) return Dumbbell;
  if (lower.includes("garden") || lower.includes("park")) return TreePine;
  return Building2;
}

export function HubAmenityChips({ facilities }: HubAmenityChipsProps) {
  if (facilities.length === 0) return null;

  return (
    <FadeIn delay={200}>
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-2.5 flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          Book amenities
        </h3>
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-background to-transparent z-10 sm:hidden" />
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {facilities.map((f) => {
              const Icon = facilityIcon(f.name);
              return (
                <Link
                  key={f.id}
                  href={`/facilities/${f.id}`}
                  className="flex shrink-0 snap-start items-center gap-2 rounded-full bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-sm ring-1 ring-foreground/5 transition-all hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {f.name}
                </Link>
              );
            })}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>
    </FadeIn>
  );
}
