"use client";

import { useState } from "react";

export function GateValidation() {
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState<{ valid: boolean; error?: string; visitorName?: string; unitNumber?: string; visitorType?: string; parkingSlot?: string; recurring?: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    if (!otp || otp.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch("/api/visitors/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ valid: false, error: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="font-heading text-2xl font-bold">Gate Validation</h1>
          <p className="text-sm text-muted-foreground">Gulshan Dynasty Security</p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 6-digit OTP"
            className="flex h-14 w-full rounded-lg border-2 border-input bg-transparent px-4 text-center text-2xl font-mono tracking-widest shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          />
          <button
            onClick={handleValidate}
            disabled={loading || otp.length !== 6}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-gold text-lg font-bold text-black transition-colors hover:bg-gold-light disabled:opacity-50"
          >
            {loading ? "Validating..." : "Validate"}
          </button>
        </div>

        {result && (
          <div className={`rounded-xl p-6 ${result.valid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            {result.valid ? (
              <div className="space-y-2">
                <div className="text-4xl">✅</div>
                <p className="font-heading text-xl font-bold text-green-800">Valid Pass</p>
                <p className="text-green-700"><strong>{result.visitorName}</strong></p>
                <p className="text-sm text-green-600">Unit {result.unitNumber} · {result.visitorType?.replace(/_/g, " ")}</p>
                {result.parkingSlot && <p className="text-sm text-green-600">Parking: {result.parkingSlot}</p>}
                {result.recurring && <p className="text-sm text-purple-600">Recurring pass</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl">❌</div>
                <p className="font-heading text-xl font-bold text-red-800">Invalid</p>
                <p className="text-sm text-red-600">{result.error}</p>
              </div>
            )}
          </div>
        )}

        {result && (
          <button
            onClick={() => { setOtp(""); setResult(null); }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Validate another
          </button>
        )}
      </div>
    </div>
  );
}
