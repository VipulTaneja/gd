import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireFaqEditor } from "@/lib/faq-auth";
import { listManageFaq } from "@/lib/faq";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await requireFaqEditor(session.user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sections = await listManageFaq();
  return NextResponse.json({ sections });
}
