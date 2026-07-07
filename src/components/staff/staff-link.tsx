import Link from "next/link";
import { cn } from "@/lib/utils";
import { staffInitials } from "@/lib/staff-labels";

interface StaffLinkProps {
  staffId: string;
  name: string;
  photoUrl?: string | null;
  className?: string;
  showAvatar?: boolean;
}

export function StaffLink({ staffId, name, photoUrl, className, showAvatar = false }: StaffLinkProps) {
  const initials = staffInitials(name);

  return (
    <Link
      href={`/staff/${staffId}`}
      className={cn(
        "inline-flex items-center gap-1.5 text-foreground transition-colors",
        "hover:text-gold hover:underline hover:underline-offset-4",
        className,
      )}
    >
      {showAvatar && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold/10 text-[10px] font-semibold text-gold">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </span>
      )}
      <span>{name}</span>
    </Link>
  );
}
