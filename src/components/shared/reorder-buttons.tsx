import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReorderButtonsProps {
  index: number;
  total: number;
  pending?: boolean;
  onMove: (direction: "up" | "down") => void;
}

export function ReorderButtons({ index, total, pending = false, onMove }: ReorderButtonsProps) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={pending || index === 0}
        onClick={() => onMove("up")}
        aria-label="Move up"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={pending || index === total - 1}
        onClick={() => onMove("down")}
        aria-label="Move down"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </>
  );
}
