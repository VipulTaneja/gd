import { formatBytes, mimeTypeIcon } from "@/lib/format-files";

interface FileListRowProps {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  createdAt: Date | string;
  actions?: React.ReactNode;
}

export function FileListRow({
  name,
  sizeBytes,
  mimeType,
  createdAt,
  actions,
}: FileListRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50">
      <span className="text-xl">{mimeTypeIcon(mimeType)}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{name}</p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(sizeBytes)} · {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
      {actions}
    </div>
  );
}
