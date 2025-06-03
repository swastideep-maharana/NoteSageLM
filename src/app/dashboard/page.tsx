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
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [title, setTitle] = useState("");

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

  if (status === "loading") return <p className="p-4">Loading...</p>;
  if (!session) return <p className="p-4">You must be signed in</p>;

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Your Notebooks</h1>
      <div className="flex gap-2 mb-6">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notebook title"
        />
        <Button onClick={createNotebook}>Add</Button>
      </div>
      <div className="space-y-3">
        {notebooks.map((nb) => (
          <NotebookCard key={nb._id} notebook={nb} onDelete={deleteNotebook} />
        ))}
      </div>
    </main>
  );
}
