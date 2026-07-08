import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExportButtons } from "./export-buttons";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Data Export</h1>
      <p className="text-muted-foreground">Export community data as CSV files.</p>
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4">Available Exports</h2>
        <ExportButtons />
      </div>
    </div>
  );
}
