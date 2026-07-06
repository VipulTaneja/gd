"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface UserLinkProps {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  role?: string;
  unitNumber?: string;
  showAvatar?: boolean;
  className?: string;
}

const roleBadgeColors: Record<string, string> = {
  SUPER_ADMIN: "bg-gold text-black",
  ADMIN: "bg-gold/20 text-gold-dark",
  RESIDENT: "bg-muted text-muted-foreground",
  NON_RESIDENT: "bg-secondary text-secondary-foreground",
  SECURITY_STAFF: "bg-blue-100 text-blue-800",
};

export function UserLink({
  userId,
  name,
  avatarUrl,
  role,
  unitNumber,
  showAvatar = false,
  className,
}: UserLinkProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const link = (
    <Link
      href={`/users/${userId}`}
      className={cn(
        "inline-flex items-center gap-1.5 text-foreground transition-colors",
        "hover:text-gold hover:underline hover:underline-offset-4",
        className
      )}
    >
      {showAvatar && (
        <Avatar size="sm">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="bg-gold/10 text-gold text-[10px]">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
      <span>{name}</span>
    </Link>
  );

  if (!role && !unitNumber) {
    return link;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<span />}>{link}</TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-1">
            {unitNumber && (
              <span className="text-xs">
                <span className="text-muted-foreground">Unit:</span> {unitNumber}
              </span>
            )}
            {role && (
              <span
                className={cn(
                  "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                  roleBadgeColors[role] ?? "bg-muted text-muted-foreground"
                )}
              >
                {role.replace("_", " ")}
              </span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
