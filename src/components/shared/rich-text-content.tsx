import { prepareRichTextForDisplay } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

interface RichTextContentProps {
  content: string;
  className?: string;
  clamp?: boolean;
}

export function RichTextContent({ content, className, clamp }: RichTextContentProps) {
  if (!content) return null;

  const html = prepareRichTextForDisplay(content);

  return (
    <div
      className={cn(
        "rich-text-content text-sm text-foreground [&_a]:text-gold [&_a]:underline",
        clamp && "line-clamp-4",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
