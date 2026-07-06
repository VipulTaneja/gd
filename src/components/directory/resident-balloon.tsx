import Link from "next/link";
import { cn } from "@/lib/utils";
import { towerBalloonStyles, type DirectoryResident } from "@/lib/directory-layout";

interface ResidentBalloonProps {
  resident: DirectoryResident;
}

export function ResidentBalloon({ resident }: ResidentBalloonProps) {
  const styles = towerBalloonStyles[resident.block] ?? towerBalloonStyles.A;

  return (
    <Link
      href={`/users/${resident.id}`}
      title={resident.name}
      className="group inline-flex max-w-[7.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-xl"
    >
      <div
        className={cn(
          "relative flex w-full min-w-[4.75rem] max-w-[7.5rem] flex-col items-center rounded-xl px-2 py-1 shadow-sm ring-1 transition-all duration-200 overflow-hidden",
          "hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
          "before:absolute before:inset-x-1.5 before:-top-0.5 before:h-1 before:rounded-full before:bg-white/50 before:content-['']",
          styles.bubble,
        )}
      >
        <span className="block w-full truncate text-center text-[11px] font-semibold leading-snug">
          {resident.name}
        </span>
      </div>
    </Link>
  );
}
