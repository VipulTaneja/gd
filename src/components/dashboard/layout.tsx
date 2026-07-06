import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { ResidentShell } from "@/components/shell/resident-shell";

export async function DashboardLayout({
  children,
  user,
}: {
  children: ReactNode;
  user: {
    name: string;
    email: string;
    globalRole: string;
    id?: string;
    avatarUrl?: string | null;
  };
}) {
  const session = await auth();
  const isLeader = session?.user?.isLeader ?? false;

  return (
    <ResidentShell user={user} isLeader={isLeader}>
      {children}
    </ResidentShell>
  );
}
