import { CasualHeader } from "@/components/shell/casual-header";
import type { HubUser } from "@/types/hub";

interface HubHeaderProps {
  user: HubUser | null;
  unreadCount: number;
}

/** @deprecated Use CasualHeader directly — kept for page.tsx compatibility */
export function HubHeader({ user, unreadCount }: HubHeaderProps) {
  return (
    <CasualHeader
      user={user}
      unreadCount={unreadCount}
    />
  );
}
