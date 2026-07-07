"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function FaqLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    router.replace(`/faq/app${hash}`);
  }, [router]);

  return null;
}
