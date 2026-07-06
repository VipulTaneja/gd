"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="text-6xl">⚠️</div>
        <h1 className="font-heading text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          An unexpected error occurred. Please try again or contact the RWA if the issue persists.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black hover:bg-gold-light"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-input px-4 text-sm font-medium hover:bg-muted"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
