"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link2,
  ImagePlus,
  Loader2,
  Heading2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { richTextToPlain } from "@/lib/rich-text";
import { uploadRichTextImage } from "@/lib/rich-text-upload";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: string;
  id?: string;
  className?: string;
  uploadNamespace?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border border-transparent px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50",
        active && "border-border bg-muted text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function clipboardImageFiles(data: DataTransfer | null): File[] {
  if (!data) return [];

  const fromFiles = Array.from(data.files ?? []).filter((file) =>
    file.type.startsWith("image/"),
  );
  if (fromFiles.length > 0) return fromFiles;

  const fromItems: File[] = [];
  for (const item of Array.from(data.items ?? [])) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) fromItems.push(file);
    }
  }
  return fromItems;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something…",
  maxLength = 10_000,
  minHeight = "160px",
  id,
  className,
  uploadNamespace,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const insertImagesRef = useRef<(files: File[]) => void>(() => {});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const insertImages = useCallback(async (files: File[]) => {
    const editor = editorRef.current;
    if (!editor || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      for (const file of files) {
        const url = await uploadRichTextImage(file, { namespace: uploadNamespace });
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    insertImagesRef.current = (files) => {
      void insertImages(files);
    };
  }, [insertImages]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "text-gold underline",
        },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-2",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class:
          "prose prose-sm max-w-none focus:outline-none px-4 py-3 text-base md:text-sm min-h-[inherit]",
      },
      handlePaste: (_view, event) => {
        const images = clipboardImageFiles(event.clipboardData);
        if (images.length === 0) return false;
        event.preventDefault();
        insertImagesRef.current(images);
        return true;
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved) return false;
        const images = clipboardImageFiles(event.dataTransfer);
        if (images.length === 0) return false;
        event.preventDefault();
        insertImagesRef.current(images);
        return true;
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  const plainLength = editor ? richTextToPlain(editor.getHTML()).length : 0;

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground",
          className,
        )}
        style={{ minHeight }}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="overflow-hidden rounded-xl border bg-card ring-foreground/5 focus-within:ring-2 focus-within:ring-gold/40">
        <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 px-2 py-1.5">
          <ToolbarButton
            label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Bullet list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Add web link" onClick={setLink} active={editor.isActive("link")}>
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Upload photo from device"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-4 w-4" />
                <span className="hidden text-xs font-medium sm:inline">Photo</span>
              </>
            )}
          </ToolbarButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length > 0) insertImagesRef.current(files);
            }}
          />
        </div>
        <div style={{ minHeight }}>
          <EditorContent editor={editor} />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>Paste, drag & drop, or use Photo to add images from your device.</span>
        <span className={plainLength > maxLength ? "font-medium text-rose-600" : undefined}>
          {plainLength.toLocaleString()}/{maxLength.toLocaleString()}
        </span>
        {uploadError && <span className="w-full text-rose-600 sm:w-auto">{uploadError}</span>}
      </div>
    </div>
  );
}
