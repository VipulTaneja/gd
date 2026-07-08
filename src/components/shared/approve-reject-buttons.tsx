import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApproveRejectButtonsProps {
  pending?: boolean;
  onApprove: () => void;
  onReject: () => void;
  size?: "sm" | "md";
  className?: string;
}

export function ApproveRejectButtons({
  pending = false,
  onApprove,
  onReject,
  size = "md",
  className,
}: ApproveRejectButtonsProps) {
  const height = size === "sm" ? "h-8" : "h-11 min-h-11 sm:min-h-9 sm:h-9";

  return (
    <div className={cn("flex gap-2", className)}>
      <button
        type="button"
        disabled={pending}
        onClick={onApprove}
        className={cn(
          "inline-flex items-center justify-center rounded-lg bg-green-600 px-3 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50",
          height,
          size === "md" && "flex-1 sm:flex-none",
        )}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={onReject}
        className={cn(
          "inline-flex items-center justify-center rounded-lg bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50",
          height,
          size === "md" && "flex-1 sm:flex-none",
        )}
      >
        Reject
      </button>
    </div>
  );
}
