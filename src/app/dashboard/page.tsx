"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NotebookCard } from "@/components/NotebookCard";

type Notebook = {
  _id: string;
  title: string;
  createdAt: string;
  tags?: string[];
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");

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

  const filteredNotebooks = notebooks.filter((nb) => {
    const lcSearch = search.toLowerCase();
    const inTitle = nb.title.toLowerCase().includes(lcSearch);
    const inTags = nb.tags?.some((tag) => tag.toLowerCase().includes(lcSearch));
    return inTitle || inTags;
  });

  if (status === "loading") return <p className="p-4">Loading...</p>;
  if (!session) return <p className="p-4">You must be signed in</p>;

  return (
    <main className="max-w-2xl mx-auto p-4">
      {/* Top Bar with Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Your Notebooks</h1>
        <Button onClick={() => setTitle("Untitled Notebook")}>
          + New Notebook
        </Button>
      </div>

      {/* Input to create custom title */}
      <div className="flex gap-2 mb-6">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notebook title"
        />
        <Button onClick={createNotebook}>Add</Button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <Input
          placeholder="Search notebooks by title or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Notebook Cards */}
      <div className="space-y-3">
        {filteredNotebooks.map((nb) => (
          <NotebookCard key={nb._id} notebook={nb} onDelete={deleteNotebook} />
        ))}
      </div>
    </main>
  );
}
