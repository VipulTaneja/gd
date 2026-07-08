import { NextResponse } from "next/server";
import { logAction } from "@/lib/audit";
import { guardFaqEditorRoute } from "@/lib/faq-auth";
import {
  createFaqSection,
  deleteFaqSection,
  reorderFaqSections,
  updateFaqSection,
} from "@/lib/faq";

export async function POST(request: Request) {
  const guard = await guardFaqEditorRoute();
  if ("error" in guard) return guard.error;

  try {
    const body = await request.json();
    const section = await createFaqSection(guard.userId, {
      title: body.title,
      description: body.description,
      isPublished: body.isPublished,
    });
    await logAction(guard.userId, "FAQ_SECTION_CREATED", "FaqSection", section.id, {
      title: section.title,
    });
    return NextResponse.json({ section });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create section" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const guard = await guardFaqEditorRoute();
  if ("error" in guard) return guard.error;

  try {
    const body = await request.json();

    if (body.reorder && Array.isArray(body.ids)) {
      await reorderFaqSections(body.ids);
      return NextResponse.json({ success: true });
    }

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const section = await updateFaqSection(guard.userId, body.id, {
      title: body.title,
      description: body.description,
      isPublished: body.isPublished,
    });
    await logAction(guard.userId, "FAQ_SECTION_UPDATED", "FaqSection", section.id, {
      title: section.title,
    });
    return NextResponse.json({ section });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update section" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const guard = await guardFaqEditorRoute();
  if ("error" in guard) return guard.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await deleteFaqSection(id);
  await logAction(guard.userId, "FAQ_SECTION_DELETED", "FaqSection", id);
  return NextResponse.json({ success: true });
}
