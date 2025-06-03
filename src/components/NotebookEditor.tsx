"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function NotebookEditor({
  content,
  notebookId,
}: {
  content: string;
  notebookId: string;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your ideas...",
      }),
    ],
    content,
  });

  const handleSave = async () => {
    if (!editor) return;
    setIsSaving(true);
    const res = await fetch(`/api/notebooks/${notebookId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editor.getHTML() }),
    });
    if (!res.ok) toast.error("Failed to save notebook.");
    setIsSaving(false);
  };

  const handleAI = async (type: "summarize" | "generate") => {
    if (!editor) return;
    setLoadingAI(true);
    const plainText = editor.getText();

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, content: plainText }),
    });

    const data = await res.json();
    if (res.ok) {
      editor.commands.setContent(data.result);
      await handleSave();
    } else {
      toast.error(data.error || "AI error");
    }

    setLoadingAI(false);
  };

  return (
    <div className="space-y-4">
      <EditorContent
        editor={editor}
        className="border rounded-xl p-4 bg-white min-h-[400px]"
      />
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button onClick={() => handleAI("summarize")} disabled={loadingAI}>
          ✨ Summarize
        </Button>
        <Button onClick={() => handleAI("generate")} disabled={loadingAI}>
          🪄 Generate
        </Button>
      </div>
    </div>
  );
}
