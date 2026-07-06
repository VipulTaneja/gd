import "next-auth";
import type { LeaderScopes } from "@/lib/leader-scopes";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      globalRole?: string;
      approvalStatus?: string;
      isActive?: boolean;
      termsAcceptedAt?: Date | null;
      isLeader?: boolean;
      leaderScopes?: LeaderScopes | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    globalRole?: string;
    approvalStatus?: string;
    isActive?: boolean;
    termsAcceptedAt?: Date | null;
    isLeader?: boolean;
    leaderScopes?: LeaderScopes | null;
    fetchedAt?: number;
  }
}
