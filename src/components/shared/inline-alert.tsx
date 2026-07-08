import { cn } from "@/lib/utils";

interface InlineAlertProps {
  children: React.ReactNode;
  variant?: "error" | "destructive";
  className?: string;
}

export function InlineAlert({ children, variant = "error", className }: InlineAlertProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-3 text-sm",
        variant === "error" && "bg-rose-50 text-rose-700",
        variant === "destructive" && "border border-destructive/30 bg-destructive/10 text-destructive",
        className,
      )}
      role="alert"
    >
      {children}
    </div>
  );
}
