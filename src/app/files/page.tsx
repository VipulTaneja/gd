import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/rbac";
import { DashboardLayout } from "@/components/dashboard/layout";
import { DocumentUpload } from "@/components/files/file-vault";
import { FileListRow } from "@/components/shared/file-list-row";
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

  const userIsAdmin = await isAdmin(session.user.id);

  const files = await db.fileEntry.findMany({
    where: { subCommunityId: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold">Society Documents</h1>
            <p className="text-muted-foreground">Bylaws, AGM minutes, and other important documents.</p>
          </div>
          {userIsAdmin && (
            <div className="w-full sm:w-auto">
              <DocumentUpload />
            </div>
          )}
        </div>

        <div className="space-y-2">
          {files.map((file) => (
            <FileListRow
              key={file.id}
              id={file.id}
              name={file.name}
              sizeBytes={file.sizeBytes}
              mimeType={file.mimeType}
              createdAt={file.createdAt}
              actions={
                <>
                  <a
                    href={`/api/files/download?id=${file.id}`}
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-input px-3 text-xs font-medium hover:bg-muted"
                  >
                    Download
                  </a>
                  {userIsAdmin && <DeleteFileButton fileId={file.id} />}
                </>
              }
            />
          ))}
          {files.length === 0 && (
            <p className="text-center py-12 text-muted-foreground">No documents uploaded yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
