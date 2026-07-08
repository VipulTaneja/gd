import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
}

export function StarRatingDisplay({
  rating,
  reviewCount,
  size = "sm",
  showValue = false,
  className,
}: StarRatingDisplayProps) {
  const rounded = Math.round(rating);
  const starSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex gap-px" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              star <= rounded ? "fill-gold text-gold" : "text-muted-foreground/30",
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      )}
      {reviewCount != null && reviewCount > 0 && (
        <span className="text-[10px] text-muted-foreground tabular-nums">({reviewCount})</span>
      )}
    </div>
  );
}
