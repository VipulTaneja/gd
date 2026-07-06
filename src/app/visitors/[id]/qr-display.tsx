"use client";

import { QRCodeSVG } from "qrcode.react";

export function QRCodeDisplay({
  passId,
  otp,
  unitNumber,
}: {
  passId: string;
  otp: string;
  unitNumber: string;
}) {
  const qrData = JSON.stringify({ passId, otp, unitNumber });

  return (
    <div className="flex justify-center">
      <div className="rounded-lg bg-white p-4">
        <QRCodeSVG value={qrData} size={200} level="M" />
      </div>
    </div>
  );
}
