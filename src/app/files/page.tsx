import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { FileUpload } from "@/components/files/file-vault";
import { DeleteFileButton } from "./delete-action";

export const dynamic = "force-dynamic";

export default async function GlobalFilesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(user.globalRole);

  const files = await db.fileEntry.findMany({
    where: { subCommunityId: null },
    orderBy: { createdAt: "desc" },
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊";
    if (mimeType.startsWith("image/")) return "🖼️";
    return "📎";
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold">Society Documents</h1>
            <p className="text-muted-foreground">Bylaws, AGM minutes, and other important documents.</p>
          </div>
          {isAdmin && <div className="w-full sm:w-auto"><FileUpload /></div>}
        </div>

        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50">
              <span className="text-xl">{getFileIcon(file.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(file.sizeBytes)} · {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
              <a
                href={`/api/files/download?id=${file.id}`}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-input px-3 text-xs font-medium hover:bg-muted"
              >
                Download
              </a>
              {isAdmin && <DeleteFileButton fileId={file.id} />}
            </div>
          ))}
          {files.length === 0 && (
            <p className="text-center py-12 text-sm text-muted-foreground">No documents uploaded yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
