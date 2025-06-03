"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { toast } from "sonner";

type NotebookEditorProps = {
  content: string;
  notebookId: string;
  initialTags?: string[];
};

export default function NotebookEditor({
  content,
  notebookId,
  initialTags = [],
}: NotebookEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialTags);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your ideas...",
      }),
    ],
    content,
  });

  useEffect(() => {
    if (!editor) return;
    const handler = setTimeout(() => {
      saveContent();
    }, 1500);

    return () => clearTimeout(handler);
  }, [editor?.getHTML(), tags]);

  const saveContent = useCallback(async () => {
    if (!editor) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/notebooks/${notebookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editor.getHTML(), tags }),
      });

      if (!res.ok) {
        toast.error("Failed to save notebook.");
      } else {
        toast.success("Notebook saved!");
      }
    } catch {
      toast.error("Network error while saving notebook.");
    } finally {
      setIsSaving(false);
    }
  }, [editor, notebookId, tags]);

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleManualSave = async () => {
    await saveContent();
  };

  const handleAI = useCallback(
    async (type: "summarize" | "generate") => {
      if (!editor) return;
      setLoadingAI(true);

      try {
        const plainText = editor.getText();

        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, content: plainText }),
        });

        const data = await res.json();

        if (res.ok && data.result) {
          editor.commands.setContent(data.result);
          await saveContent();
          toast.success(
            `${type === "summarize" ? "Summarized" : "Generated"} successfully.`
          );
        } else {
          toast.error(data.error || "AI error occurred.");
        }
      } catch {
        toast.error("Network error calling AI.");
      } finally {
        setLoadingAI(false);
      }
    },
    [editor, saveContent]
  );

  return (
    <div className="space-y-4">
      <EditorContent
        editor={editor}
        className="border rounded-xl p-4 bg-white min-h-[400px] max-w-full overflow-auto"
      />

      {/* Tags input */}
      <div>
        <label className="block mb-1 font-semibold">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, idx) => (
            <div
              key={idx}
              className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full cursor-pointer select-none"
              onClick={() => removeTag(idx)}
              title="Click to remove tag"
            >
              {tag} ×
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add tags (press enter or comma)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagInputKeyDown}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleManualSave} disabled={isSaving || loadingAI}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button
          onClick={() => handleAI("summarize")}
          disabled={loadingAI || isSaving}
        >
          {loadingAI ? "Processing..." : "✨ Summarize"}
        </Button>
        <Button
          onClick={() => handleAI("generate")}
          disabled={loadingAI || isSaving}
        >
          {loadingAI ? "Processing..." : "🪄 Generate"}
        </Button>
      </div>
    </div>
  );
}
