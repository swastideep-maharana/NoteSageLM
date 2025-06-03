"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NotebookEditor from "@/components/NotebookEditor";

type Notebook = {
  _id: string;
  title: string;
  content: string;
  tags: string[];
};

export default function NotebookPage({
  params,
}: {
  params: { notebookId: string };
}) {
  const router = useRouter();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/notebooks`)
      .then((res) => res.json())
      .then((data: Notebook[]) => {
        const found = data.find((n) => n._id === params.notebookId);
        if (!found) {
          router.replace("/dashboard");
        } else {
          setNotebook(found);
        }
      })
      .finally(() => setLoading(false));
  }, [params.notebookId, router]);

  if (loading) return <div>Loading...</div>;
  if (!notebook) return <div>Notebook not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{notebook.title}</h1>
      <NotebookEditor
        content={notebook.content}
        notebookId={notebook._id}
        initialTags={notebook.tags}
      />
    </div>
  );
}
