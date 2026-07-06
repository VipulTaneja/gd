"use client";

import { ReactNode } from "react";
import { ResidentShell } from "@/components/shell/resident-shell";

export function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    globalRole: string;
    id?: string;
    avatarUrl?: string | null;
  };
}) {
  return <ResidentShell user={user}>{children}</ResidentShell>;
}
