"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function StarRatingInput({ value, onChange, disabled, size = "md" }: StarRatingInputProps) {
  const iconSize = size === "sm" ? "h-5 w-5" : "h-8 w-8";

  return (
    <div className="flex gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className={cn(
            "min-h-11 min-w-11 flex items-center justify-center rounded-md transition-colors",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={cn(
              iconSize,
              star <= value ? "fill-gold text-gold" : "text-muted-foreground",
            )}
          />
        </button>
      ))}
    </div>
  );
}
