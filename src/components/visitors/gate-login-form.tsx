"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function GateLoginForm() {
  const [pin, setPin] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/gate/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/gate");
      } else {
        setError(data.error || "Invalid PIN");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="space-y-1.5">
        <label htmlFor="gate-pin" className="text-sm font-medium">Security PIN</label>
        <input
          id="gate-pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
          placeholder="Enter your 4-6 digit PIN"
          maxLength={6}
          className="flex h-12 w-full rounded-lg border border-input bg-transparent px-4 text-center text-2xl font-mono tracking-widest shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <button type="submit" disabled={pending}
        className="flex h-11 w-full items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50">
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Logging in...</>
        ) : (
          "Enter Gate"
        )}
      </button>
    </form>
  );
}
