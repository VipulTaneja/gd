import { ReactNode } from "react";
import { SoftCard } from "@/components/shared/soft-card";

interface DetailHeroCardProps {
  accent?: "gold" | "amber" | "sky" | "rose" | "emerald" | "none";
  avatarClassName: string;
  avatarContent: ReactNode;
  children: ReactNode;
}

export function DetailHeroCard({
  accent = "none",
  avatarClassName,
  avatarContent,
  children,
}: DetailHeroCardProps) {
  return (
    <SoftCard accent={accent}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-xl font-bold ${avatarClassName}`}
        >
          {avatarContent}
        </div>
        <div className="flex-1 space-y-2">{children}</div>
      </div>
    </SoftCard>
  );
}
