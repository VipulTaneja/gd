"use client";

import { useState } from "react";
import { PhoneLink } from "@/components/shared/phone-link";
import { UnitLink } from "@/components/shared/unit-link";
import { FadeIn } from "@/components/shared/animated";
import { SuccessAnimation } from "@/components/shared/success-animation";
import { FriendlyBadge } from "@/components/shared/friendly-badge";

interface ValidationResult {
  valid: boolean;
  error?: string;
  reason?: "NOT_FOUND" | "OUTSIDE_WINDOW";
  validFrom?: string;
  validUntil?: string;
  visitorName?: string;
  unitNumber?: string;
  unitNumbers?: string[];
  visitorType?: string;
  parkingSlot?: string;
  recurring?: boolean;
  staffPhone?: string | null;
  isStaffPass?: boolean;
}

export function GateValidation() {
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
      if (data.valid) setShowSuccess(true);
    } catch {
      setResult({ valid: false, error: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const displayUnits = result?.unitNumbers?.length
    ? result.unitNumbers
    : result?.unitNumber
      ? result.unitNumber.split(",").map((u) => u.trim()).filter(Boolean)
      : [];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="font-heading text-2xl font-bold">Gate Validation</h1>
          <p className="text-sm text-muted-foreground">Gulshan Dynasty Security</p>
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleValidate();
          }}
        >
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
            type="submit"
            disabled={loading || otp.length !== 6}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-gold text-lg font-bold text-black transition-colors hover:bg-gold-light disabled:opacity-50"
          >
            {loading ? "Validating..." : "Validate"}
          </button>
        </form>

        {showSuccess && (
          <SuccessAnimation message="Valid pass!" onComplete={() => setShowSuccess(false)} />
        )}

        {result && (
          <div className={`rounded-xl p-6 ${result.valid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            {result.valid ? (
              <FadeIn className="space-y-2">
                <div className="text-4xl">✅</div>
                <p className="font-heading text-xl font-bold text-green-800">Valid Pass</p>
                <p className="text-green-700"><strong>{result.visitorName}</strong></p>
                {displayUnits.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1">
                    {displayUnits.map((unit) => (
                      <UnitLink key={unit} unitNumber={unit} className="text-green-800 border-green-300" />
                    ))}
                  </div>
                )}
                <p className="text-sm text-green-600">{result.visitorType?.replace(/_/g, " ")}</p>
                {result.parkingSlot && <p className="text-sm text-green-600">Parking: {result.parkingSlot}</p>}
                {result.recurring && <FriendlyBadge value="RECURRING" variant="semantic" />}
                {result.staffPhone && (
                  <div className="pt-2">
                    <PhoneLink phone={result.staffPhone} className="text-green-700 justify-center" />
                  </div>
                )}
              </FadeIn>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl">❌</div>
                <p className="font-heading text-xl font-bold text-red-800">Invalid</p>
                <p className="text-sm text-red-600">{result.error}</p>
                {result.reason === "OUTSIDE_WINDOW" && result.validFrom && result.validUntil && (
                  <p className="text-xs text-red-500">
                    Valid {new Date(result.validFrom).toLocaleString()} — {new Date(result.validUntil).toLocaleString()}
                  </p>
                )}
                <button
                  onClick={handleValidate}
                  disabled={loading}
                  className="min-h-11 text-sm font-medium text-red-700 hover:underline disabled:opacity-50"
                >
                  {loading ? "Retrying..." : "Retry"}
                </button>
              </div>
            )}
          </div>
        )}

        {result && (
          <button
            onClick={() => { setOtp(""); setResult(null); }}
            className="min-h-11 text-sm text-muted-foreground hover:text-foreground"
          >
            Validate another
          </button>
        )}
      </div>
    </div>
  );
}
