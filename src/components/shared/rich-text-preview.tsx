import { isLikelyHtml, richTextToPlain } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

interface RichTextPreviewProps {
  content: string;
  className?: string;
  clamp?: boolean;
}

/** Plain-text preview for list cards — strips HTML safely. */
export function RichTextPreview({ content, className, clamp }: RichTextPreviewProps) {
  if (!content) return null;
  const text = isLikelyHtml(content) ? richTextToPlain(content) : content;
  return (
    <p className={cn("text-sm text-muted-foreground whitespace-pre-wrap", clamp && "line-clamp-4", className)}>
      {text}
    </p>
  );
}
