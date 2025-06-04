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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Notebook Not Found
        </h1>
        <p className="text-gray-600 mb-4">
          The requested notebook could not be found.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">{notebook.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Tags Section */}
      {notebook.tags && notebook.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {notebook.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Editor Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <NotebookEditor
          content={notebook.content}
          notebookId={notebook._id}
          initialTags={notebook.tags}
        />
      </div>

      {/* Key Features Section */}
      <div className="bg-gray-50 rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Key Features</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Real-time auto-saving of your content</li>
          <li>Rich text editing capabilities</li>
          <li>Tag management for better organization</li>
          <li>AI-powered summarization and generation</li>
          <li>Easy navigation and document management</li>
        </ul>
      </div>
    </div>
  );
}
