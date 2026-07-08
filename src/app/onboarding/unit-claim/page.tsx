"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const TOWERS = ["A", "B", "C"];

export default function UnitClaimPage() {
  const [tower, setTower] = useState("");
  const [floor, setFloor] = useState("");
  const [unit, setUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const floors = tower ? Array.from({ length: 34 }, (_, i) => i + 1) : [];
  const units = tower && floor ? ["01", "02"] : [];

  const handleSubmit = async () => {
    if (!tower || !floor || !unit) return;
    setLoading(true);
    try {
      const unitNumber = `${tower}-${String(floor).padStart(2, "0")}${unit}`;
      const res = await fetch("/api/onboarding/unit-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitNumber }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <Image
            src="/logo.webp"
            alt="Gulshan Dynasty"
            width={200}
            height={50}
            className="mx-auto h-12 w-auto"
            priority
          />
          <h1 className="font-heading text-3xl font-bold">Unit Claim Submitted</h1>
          <p className="text-muted-foreground">
            You&apos;ve claimed unit <strong>{tower}-{String(floor).padStart(2, "0")}{unit}</strong>.
            An admin will verify and link your account to this unit.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-gold px-6 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gold-light"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Image
            src="/logo.webp"
            alt="Gulshan Dynasty"
            width={200}
            height={50}
            className="mx-auto h-12 w-auto"
            priority
          />
          <h1 className="mt-6 font-heading text-3xl font-bold">Claim Your Unit</h1>
          <p className="mt-2 text-muted-foreground">
            Select your tower, floor, and unit number. An admin will verify this.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tower</label>
            <select
              value={tower}
              onChange={(e) => {
                setTower(e.target.value);
                setFloor("");
                setUnit("");
              }}
              className="flex h-11 w-full rounded-lg border border-input bg-transparent px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select tower</option>
              {TOWERS.map((t) => (
                <option key={t} value={t}>
                  Tower {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Floor</label>
            <select
              value={floor}
              onChange={(e) => {
                setFloor(e.target.value);
                setUnit("");
              }}
              disabled={!tower}
              className="flex h-11 w-full rounded-lg border border-input bg-transparent px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="">Select floor</option>
              {floors.map((f) => (
                <option key={f} value={f}>
                  Floor {f}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              disabled={!floor}
              className="flex h-11 w-full rounded-lg border border-input bg-transparent px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="">Select unit</option>
              {units.map((u) => (
                <option key={u} value={u}>
                  Unit {u}
                </option>
              ))}
            </select>
          </div>

          {tower && floor && unit && (
            <div className="rounded-lg border bg-card p-4 text-center text-card-foreground">
              <p className="text-sm text-muted-foreground">You are claiming:</p>
              <p className="mt-1 font-heading text-xl font-bold">
                {tower}-{String(floor).padStart(2, "0")}{unit}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!tower || !floor || !unit || loading}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-gold px-6 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Claim"}
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
