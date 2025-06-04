// app/dashboard/imported/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ImportedPage() {
  const params = useSearchParams();
  const router = useRouter();
  const defaultContent = params.get("content") || "";

  const [title, setTitle] = useState("AI Summary");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState(defaultContent);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          tags: tags.split(",").map((t) => t.trim()),
        }),
      });

      const notebook = await res.json();
      router.push(`/dashboard/${notebook._id}`);
    } catch {
      toast.error("Failed to save notebook");
    }
    setSaving(false);
  };

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Edit AI Summary</h1>

      <Input
        placeholder="Notebook Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Input
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <Textarea
        rows={12}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Notebook"}
      </Button>
    </main>
  );
}
