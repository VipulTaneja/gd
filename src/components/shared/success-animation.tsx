"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAnimationProps {
  message?: string;
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

export function SuccessAnimation({
  message = "Done!",
  duration = 1500,
  onComplete,
  className,
}: SuccessAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in-up",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="animate-badge-pop">
          <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        </div>
        <p className="text-lg font-semibold text-foreground">{message}</p>
      </div>
    </div>
  );
}
