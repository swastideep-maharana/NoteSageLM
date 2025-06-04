"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { URLInput } from "@/components/URLInput";
import { FileUpload } from "@/components/FileUpload";
import { ArrowLeft, Save } from "lucide-react";

interface Notebook {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  type?: string;
  urls?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function EditNotebookPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch notebook data
    fetch(`/api/notebooks/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setNotebook(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching notebook:", error);
        setIsLoading(false);
      });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notebook) return;

    try {
      const response = await fetch(`/api/notebooks/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notebook),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        console.error("Failed to update notebook");
      }
    } catch (error) {
      console.error("Error updating notebook:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!notebook) {
    return <div>Notebook not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Notebook</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={notebook.title}
              onChange={(e) =>
                setNotebook({ ...notebook, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={notebook.description || ""}
              onChange={(e) =>
                setNotebook({ ...notebook, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={notebook.content || ""}
              onChange={(e) =>
                setNotebook({ ...notebook, content: e.target.value })
              }
              rows={10}
            />
          </div>

          <div className="space-y-2">
            <Label>URLs</Label>
            <URLInput
              urls={notebook.urls || []}
              onAddURL={(url) =>
                setNotebook({
                  ...notebook,
                  urls: [...(notebook.urls || []), url],
                })
              }
              onRemoveURL={(url) =>
                setNotebook({
                  ...notebook,
                  urls: (notebook.urls || []).filter((u) => u !== url),
                })
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
