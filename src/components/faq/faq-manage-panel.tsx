"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import type { FaqSectionDto } from "@/lib/faq";
import { faq as faqCopy } from "@/lib/microcopy";

interface FaqManagePanelProps {
  initialSections: FaqSectionDto[];
}

export function FaqManagePanel({ initialSections }: FaqManagePanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newItemSectionId, setNewItemSectionId] = useState<string | null>(null);

  const refresh = () => startTransition(() => router.refresh());

  async function apiCall(url: string, init?: RequestInit) {
    const res = await fetch(url, init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  async function handleCreateSection(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiCall("/api/faq/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSectionTitle }),
      });
      setNewSectionTitle("");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <form onSubmit={handleCreateSection} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          placeholder={faqCopy.newSectionPlaceholder}
          required
          className="flex h-11 flex-1 rounded-md border border-input bg-transparent px-3 text-base shadow-sm md:text-sm"
        />
        <Button type="submit" disabled={pending} className="min-h-11">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {faqCopy.addSection}
        </Button>
      </form>

      {initialSections.length === 0 ? (
        <p className="text-sm text-muted-foreground">{faqCopy.manageEmpty}</p>
      ) : (
        initialSections.map((section, sectionIndex) => (
          <SectionCard
            key={section.id}
            section={section}
            allSections={initialSections}
            sectionIndex={sectionIndex}
            pending={pending}
            editingSectionId={editingSectionId}
            editingItemId={editingItemId}
            newItemSectionId={newItemSectionId}
            onEditSection={() => setEditingSectionId(section.id)}
            onCancelSection={() => setEditingSectionId(null)}
            onEditItem={(id) => setEditingItemId(id)}
            onCancelItem={() => setEditingItemId(null)}
            onNewItem={() => setNewItemSectionId(section.id)}
            onCancelNewItem={() => setNewItemSectionId(null)}
            onError={setError}
            onRefresh={refresh}
            apiCall={apiCall}
          />
        ))
      )}
    </div>
  );
}

function SectionCard({
  section,
  allSections,
  sectionIndex,
  pending,
  editingSectionId,
  editingItemId,
  newItemSectionId,
  onEditSection,
  onCancelSection,
  onEditItem,
  onCancelItem,
  onNewItem,
  onCancelNewItem,
  onError,
  onRefresh,
  apiCall,
}: {
  section: FaqSectionDto;
  allSections: FaqSectionDto[];
  sectionIndex: number;
  pending: boolean;
  editingSectionId: string | null;
  editingItemId: string | null;
  newItemSectionId: string | null;
  onEditSection: () => void;
  onCancelSection: () => void;
  onEditItem: (id: string) => void;
  onCancelItem: () => void;
  onNewItem: () => void;
  onCancelNewItem: () => void;
  onError: (msg: string | null) => void;
  onRefresh: () => void;
  apiCall: (url: string, init?: RequestInit) => Promise<unknown>;
}) {
  const isEditing = editingSectionId === section.id;

  async function saveSection(form: FormData) {
    onError(null);
    try {
      await apiCall("/api/faq/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: section.id,
          title: form.get("title"),
          description: form.get("description") || null,
          isPublished: form.get("isPublished") === "on",
        }),
      });
      onCancelSection();
      onRefresh();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function deleteSection() {
    if (!confirm(faqCopy.deleteSectionConfirm(section.items.length))) return;
    onError(null);
    try {
      await apiCall(`/api/faq/sections?id=${section.id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function moveSection(direction: "up" | "down") {
    const swap = direction === "up" ? sectionIndex - 1 : sectionIndex + 1;
    if (swap < 0 || swap >= allSections.length) return;
    onError(null);
    try {
      const ids = allSections.map((s) => s.id);
      [ids[sectionIndex], ids[swap]] = [ids[swap], ids[sectionIndex]];
      await apiCall("/api/faq/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder: true, ids }),
      });
      onRefresh();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function moveItem(itemId: string, direction: "up" | "down") {
    const idx = section.items.findIndex((i) => i.id === itemId);
    const swap = direction === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= section.items.length) return;
    onError(null);
    try {
      const ids = section.items.map((i) => i.id);
      [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
      await apiCall("/api/faq/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder: true, sectionId: section.id, ids }),
      });
      onRefresh();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      {isEditing ? (
        <form action={saveSection} className="space-y-3">
          <input
            name="title"
            defaultValue={section.title}
            required
            className="flex h-11 w-full rounded-md border px-3 text-base md:text-sm"
          />
          <textarea
            name="description"
            defaultValue={section.description ?? ""}
            rows={2}
            className="w-full rounded-md border px-3 py-2 text-base md:text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked={section.isPublished} />
            {faqCopy.published}
          </label>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>{faqCopy.save}</Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancelSection}>
              {faqCopy.cancel}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold">{section.title}</h2>
            {section.description && (
              <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {section.isPublished ? faqCopy.published : faqCopy.draft} · {section.items.length}{" "}
              {faqCopy.questions}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={sectionIndex === 0 || pending}
              onClick={() => moveSection("up")}
              aria-label={faqCopy.moveUp}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={sectionIndex === allSections.length - 1 || pending}
              onClick={() => moveSection("down")}
              aria-label={faqCopy.moveDown}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onEditSection}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={deleteSection}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onNewItem}>
              <Plus className="h-3.5 w-3.5" />
              {faqCopy.addQuestion}
            </Button>
          </div>
        </div>
      )}

      {newItemSectionId === section.id && (
        <ItemForm
          sectionId={section.id}
          onCancel={onCancelNewItem}
          onSaved={() => {
            onCancelNewItem();
            onRefresh();
          }}
          onError={onError}
          apiCall={apiCall}
          pending={pending}
        />
      )}

      <div className="space-y-3">
        {section.items.map((item, itemIndex) =>
          editingItemId === item.id ? (
            <ItemForm
              key={item.id}
              sectionId={section.id}
              item={item}
              onCancel={onCancelItem}
              onSaved={() => {
                onCancelItem();
                onRefresh();
              }}
              onError={onError}
              apiCall={apiCall}
              pending={pending}
            />
          ) : (
            <div key={item.id} className="rounded-lg border bg-muted/20 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{item.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.isPublished ? faqCopy.published : faqCopy.draft}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={itemIndex === 0 || pending}
                    onClick={() => moveItem(item.id, "up")}
                    aria-label={faqCopy.moveUp}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={itemIndex === section.items.length - 1 || pending}
                    onClick={() => moveItem(item.id, "down")}
                    aria-label={faqCopy.moveDown}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => onEditItem(item.id)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!confirm(faqCopy.deleteQuestionConfirm)) return;
                      await apiCall(`/api/faq/items?id=${item.id}`, { method: "DELETE" });
                      onRefresh();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function ItemForm({
  sectionId,
  item,
  onCancel,
  onSaved,
  onError,
  apiCall,
  pending,
}: {
  sectionId: string;
  item?: FaqSectionDto["items"][0];
  onCancel: () => void;
  onSaved: () => void;
  onError: (msg: string | null) => void;
  apiCall: (url: string, init?: RequestInit) => Promise<unknown>;
  pending: boolean;
}) {
  const [question, setQuestion] = useState(item?.question ?? "");
  const [answer, setAnswer] = useState(item?.answer ?? "");
  const [isPublished, setIsPublished] = useState(item?.isPublished ?? false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    setSaving(true);
    try {
      if (item) {
        await apiCall("/api/faq/items", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, question, answer, isPublished }),
        });
      } else {
        await apiCall("/api/faq/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionId, question, answer, isPublished }),
        });
      }
      onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-background p-4 space-y-3">
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={faqCopy.questionPlaceholder}
        required
        maxLength={500}
        className="flex h-11 w-full rounded-md border px-3 text-base md:text-sm"
      />
      <RichTextEditor
        value={answer}
        onChange={setAnswer}
        placeholder={faqCopy.answerPlaceholder}
        uploadNamespace="faq"
        minHeight="200px"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
        />
        {faqCopy.published}
      </label>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending || saving}>
          {(pending || saving) && <Loader2 className="h-4 w-4 animate-spin" />}
          {faqCopy.save}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          {faqCopy.cancel}
        </Button>
      </div>
    </form>
  );
}
