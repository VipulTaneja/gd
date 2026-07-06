import { UnitLink } from "@/components/shared/unit-link";
import { FadeIn } from "@/components/shared/animated";
import { greetings } from "@/lib/microcopy";
import type { HubUser } from "@/types/hub";

interface HubGreetingProps {
  user: HubUser | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function HubGreeting({ user }: HubGreetingProps) {
  if (!user) {
    return (
      <FadeIn className="py-2">
      <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          {greetings.guestTitle}
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          {greetings.guestSubtitle}
        </p>
      </FadeIn>
    );
  }

  const firstName = user.name.split(" ")[0];

  return (
    <FadeIn className="py-2">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
        {getGreeting()}, {firstName}{" "}
        <span className="animate-wave inline-block" aria-hidden="true">
          👋
        </span>
      </h1>
      <p className="mt-1.5 text-muted-foreground flex items-center gap-1.5 flex-wrap text-sm">
        {user.primaryUnit && (
          <>
            <span>Tower {user.primaryUnit.block}</span>
            <span className="text-border">·</span>
            <UnitLink unitNumber={user.primaryUnit.unitNumber} />
          </>
        )}
      </p>
    </FadeIn>
  );
}
