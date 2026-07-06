import Image from "next/image";
import { Home, Building2, Leaf, MapPin } from "lucide-react";
import { SoftCard } from "@/components/shared/soft-card";
import { FadeIn } from "@/components/shared/animated";

const stats = [
  { icon: Home, label: "204 homes" },
  { icon: Building2, label: "3 towers" },
  { icon: Leaf, label: "IGBC Platinum" },
  { icon: MapPin, label: "5.8 acres" },
];

export function HubCommunityPulse() {
  return (
    <FadeIn delay={150}>
      <SoftCard className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Image
            src="https://www.gulshandynasty.com/images/overview.webp"
            alt="Gulshan Dynasty"
            width={120}
            height={80}
            className="rounded-xl object-cover h-20 w-auto ring-1 ring-foreground/5 self-center sm:self-auto"
          />
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {stats.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold-dark"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Sector 144, Noida Expressway
            </p>
          </div>
        </div>
      </SoftCard>
    </FadeIn>
  );
}
