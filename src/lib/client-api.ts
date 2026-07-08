"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function useJsonMutation() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const refresh = () => startTransition(() => router.refresh());

  async function apiCall(url: string, init?: RequestInit) {
    const res = await fetch(url, init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  return { pending, error, setError, refresh, apiCall, startTransition };
}
