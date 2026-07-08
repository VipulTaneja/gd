import { NextResponse } from "next/server";
import { logAction } from "@/lib/audit";
import { guardFaqEditorRoute } from "@/lib/faq-auth";
import {
  createFaqItem,
  deleteFaqItem,
  reorderFaqItems,
  updateFaqItem,
} from "@/lib/faq";

export async function POST(request: Request) {
  const guard = await guardFaqEditorRoute();
  if ("error" in guard) return guard.error;

  try {
    const body = await request.json();
    const item = await createFaqItem(guard.userId, {
      sectionId: body.sectionId,
      question: body.question,
      answer: body.answer,
      isPublished: body.isPublished,
    });
    await logAction(guard.userId, "FAQ_ITEM_CREATED", "FaqItem", item.id, {
      question: item.question,
    });
    return NextResponse.json({ item });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create item" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const guard = await guardFaqEditorRoute();
  if ("error" in guard) return guard.error;

  try {
    const body = await request.json();

    if (body.reorder && body.sectionId && Array.isArray(body.ids)) {
      await reorderFaqItems(body.sectionId, body.ids);
      return NextResponse.json({ success: true });
    }

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const item = await updateFaqItem(guard.userId, body.id, {
      question: body.question,
      answer: body.answer,
      isPublished: body.isPublished,
    });
    await logAction(guard.userId, "FAQ_ITEM_UPDATED", "FaqItem", item.id, {
      question: item.question,
    });
    return NextResponse.json({ item });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update item" },
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

  await deleteFaqItem(id);
  await logAction(guard.userId, "FAQ_ITEM_DELETED", "FaqItem", id);
  return NextResponse.json({ success: true });
}
