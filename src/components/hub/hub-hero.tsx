import Image from "next/image";
import Link from "next/link";
import { Home, Building2, Leaf, MapPin } from "lucide-react";
import { UnitLink } from "@/components/shared/unit-link";
import { FadeIn } from "@/components/shared/animated";
import { actions, greetings } from "@/lib/microcopy";
import { cn } from "@/lib/utils";
import { defaultHeroTint, hubHero, towerHeroTint } from "@/lib/hub-images";
import type { HubUser } from "@/types/hub";

interface HubHeroProps {
  user: HubUser | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const statChips = [
  { icon: Home, label: "204 homes" },
  { icon: Building2, label: "3 towers" },
  { icon: Leaf, label: "IGBC Platinum" },
];

export function HubHero({ user }: HubHeroProps) {
  const tower = user?.primaryUnit?.block;
  const overlayTint = tower ? (towerHeroTint[tower] ?? defaultHeroTint) : defaultHeroTint;

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[220px] sm:h-[280px] md:h-[320px]">
        <Image
          src={hubHero.src}
          alt={hubHero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t",
            overlayTint
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          <FadeIn className="max-w-2xl text-white">
            {user ? (
              <>
                <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                  {getGreeting()}, {user.name.split(" ")[0]}{" "}
                  <span className="animate-wave inline-block" aria-hidden="true">
                    👋
                  </span>
                </h1>
                {user.primaryUnit && (
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/90 sm:text-base">
                    <span>Tower {user.primaryUnit.block}</span>
                    <span className="text-white/50">·</span>
                    <UnitLink
                      unitNumber={user.primaryUnit.unitNumber}
                      className="border-white/30 bg-white/15 text-white hover:bg-white/25"
                    />
                  </p>
                )}
              </>
            ) : (
              <>
                <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                  {greetings.guestTitle}
                </h1>
                <p className="mt-2 text-sm text-white/90 sm:text-base">
                  {greetings.guestSubtitle}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href="/login"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-6 text-sm font-semibold text-black shadow-lg transition-colors hover:bg-gold-light"
                  >
                    {actions.signIn}
                  </Link>
                  <p className="text-xs text-white/75 sm:text-sm">{greetings.guestCtaHint}</p>
                </div>
              </>
            )}
          </FadeIn>
        </div>
      </div>

      {!user && (
        <div className="border-b bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 px-4 py-3 sm:justify-start sm:px-6 lg:px-8">
            {statChips.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold-dark"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              Sector 144, Noida
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
