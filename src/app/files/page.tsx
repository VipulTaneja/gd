import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/rbac";
import { DashboardLayout } from "@/components/dashboard/layout";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DocumentUpload } from "@/components/files/file-vault";
import { FileListRow } from "@/components/shared/file-list-row";
import { DeleteFileButton } from "./delete-action";
import { empty } from "@/lib/microcopy";

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <PageHeader
            feature="files"
            title="Society Documents"
            subtitle="Bylaws, AGM minutes, and other important documents."
          />
          {userIsAdmin && (
            <div className="w-full sm:w-auto">
              <DocumentUpload />
            </div>
          )}
        </div>

        {files.length === 0 ? (
          <EmptyState icon={FileText} title={empty.files.title} description={empty.files.description} />
        ) : (
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
