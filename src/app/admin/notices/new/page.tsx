import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NoticeForm } from "@/components/notices/notice-form";

export const dynamic = "force-dynamic";

export default async function NewNoticePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-heading text-2xl font-bold">Create Notice</h1>
      <div className="rounded-xl border bg-card p-6">
        <NoticeForm />
      </div>
    </div>
  );
}
