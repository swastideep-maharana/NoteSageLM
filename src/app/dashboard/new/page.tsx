"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function NewNotebookPage() {
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const createNotebook = async () => {
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    setIsCreating(true);

    try {
      const res = await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create notebook");
      }

      const notebook = await res.json();

      // Redirect to notebook editor page
      router.push(`/dashboard/${notebook._id}`);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Create New Notebook</h1>

      <Input
        placeholder="Notebook title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isCreating}
      />

      <Button onClick={createNotebook} disabled={isCreating} className="mt-4">
        {isCreating ? "Creating..." : "Create Notebook"}
      </Button>
    </main>
  );
}
