import Image from "next/image";
import { MapPin } from "lucide-react";
import { SoftCard } from "@/components/shared/soft-card";
import { FadeIn } from "@/components/shared/animated";
import { hubGallery } from "@/lib/hub-images";
import { communityStats } from "@/lib/community-stats";

export function HubCommunityPulse() {
  return (
    <FadeIn delay={150}>
      <SoftCard className="overflow-hidden p-0">
        <div className="grid grid-cols-3 grid-rows-2 gap-0.5 sm:gap-1">
          {hubGallery.map((image, index) => (
            <div
              key={image.src}
              className={cnMosaicCell(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="p-4">
          <p className="text-sm font-medium text-foreground">Life at Gulshan Dynasty</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {communityStats.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold-dark"
              >
                <Icon className="h-3 w-3" />
                {label}
              </span>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            Sector 144, Noida Expressway
          </p>
        </div>
      </SoftCard>
    </FadeIn>
  );
}

function cnMosaicCell(index: number) {
  if (index === 0) return "relative col-span-2 row-span-2 min-h-[120px] sm:min-h-[140px]";
  return "relative min-h-[60px] sm:min-h-[68px]";
}
