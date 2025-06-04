"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NotebookCard } from "@/components/NotebookCard";
import { ExportButton } from "@/components/ExportButton";
import { SmartImportButton } from "@/components/SmartImportButton"; // ✅ Only keeping this
import { NotebookList } from "@/components/NotebookList";
import { CreateNotebookModal } from "@/components/CreateNotebookModal";
import { Plus } from "lucide-react";

type Notebook = {
  _id: string;
  title: string;
  createdAt: string;
  tags?: string[];
  content?: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (session) {
      fetch("/api/notebooks")
        .then((res) => res.json())
        .then(setNotebooks);
    }
  }, [session]);

  const createNotebook = async () => {
    if (!title) return;
    const res = await fetch("/api/notebooks", {
      method: "POST",
      body: JSON.stringify({ title }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setNotebooks((prev) => [data, ...prev]);
    setTitle("");
  };

  const deleteNotebook = async (id: string) => {
    await fetch(`/api/notebooks/${id}`, { method: "DELETE" });
    setNotebooks((prev) => prev.filter((n) => n._id !== id));
  };

  const handleSmartImport = async (notebook: {
    title: string;
    content: string;
  }) => {
    const res = await fetch("/api/notebooks", {
      method: "POST",
      body: JSON.stringify(notebook),
      headers: { "Content-Type": "application/json" },
    });
    const saved = await res.json();
    setNotebooks((prev) => [saved, ...prev]);
  };

  const handleCreateNotebook = async (data: {
    title: string;
    description: string;
    type: string;
    urls: string[];
    files: File[];
    aiOptions: {
      summarize: boolean;
      mindmap: boolean;
      roadmap: boolean;
    };
  }) => {
    // Here you would typically make an API call to create the notebook
    // For now, we'll just add it to the local state
    const newNotebook: Notebook = {
      _id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      createdAt: new Date().toISOString(),
    };

    setNotebooks((prev) => [...prev, newNotebook]);
  };

  const handleDeleteNotebook = (id: string) => {
    setNotebooks(notebooks.filter((notebook) => notebook._id !== id));
  };

  const handleStarNotebook = (id: string) => {
    setNotebooks(
      notebooks.map((notebook) =>
        notebook._id === id
          ? { ...notebook, isStarred: !notebook.isStarred }
          : notebook
      )
    );
  };

  const handleEditNotebook = (id: string) => {
    // Implement edit functionality
    console.log("Edit notebook:", id);
  };

  const handleAddURL = (id: string, url: string) => {
    setNotebooks(
      notebooks.map((notebook) =>
        notebook._id === id
          ? {
              ...notebook,
              urls: [...(notebook.urls || []), url],
            }
          : notebook
      )
    );
  };

  const handleRemoveURL = (id: string, url: string) => {
    setNotebooks(
      notebooks.map((notebook) =>
        notebook._id === id
          ? {
              ...notebook,
              urls: (notebook.urls || []).filter((u) => u !== url),
            }
          : notebook
      )
    );
  };

  const filteredNotebooks = notebooks.filter((nb) => {
    const lcSearch = search.toLowerCase();
    const inTitle = nb.title.toLowerCase().includes(lcSearch);
    const inTags = nb.tags?.some((tag) => tag.toLowerCase().includes(lcSearch));
    return inTitle || inTags;
  });

  if (status === "loading") return <p className="p-4">Loading...</p>;
  if (!session) return <p className="p-4">You must be signed in</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notebooks</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Notebook
        </Button>
      </div>

      <NotebookList
        notebooks={notebooks}
        onDelete={handleDeleteNotebook}
        onStar={handleStarNotebook}
        onEdit={handleEditNotebook}
        onAddURL={handleAddURL}
        onRemoveURL={handleRemoveURL}
      />

      <CreateNotebookModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateNotebook}
      />
    </div>
  );
}
