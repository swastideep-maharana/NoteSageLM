"use client";

import { NotebookCard } from "@/components/NotebookCard";
import { motion } from "framer-motion";

interface Notebook {
  id: string;
  title: string;
  description?: string;
  content?: string;
  type?: string;
  isStarred?: boolean;
  urls?: string[];
  createdAt: string;
  updatedAt: string;
}

interface NotebookListProps {
  notebooks: Notebook[];
  onDelete: (id: string) => void;
  onStar?: (id: string) => void;
  onEdit?: (id: string) => void;
  onAddURL?: (id: string, url: string) => void;
  onRemoveURL?: (id: string, url: string) => void;
}

export function NotebookList({
  notebooks,
  onDelete,
  onStar,
  onEdit,
  onAddURL,
  onRemoveURL,
}: NotebookListProps) {
  if (notebooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <div className="rounded-full bg-muted p-3">
          <svg
            className="h-6 w-6 text-muted-foreground"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold">No notebooks found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first notebook to get started
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {notebooks.map((notebook) => (
        <NotebookCard
          key={notebook.id}
          notebook={notebook}
          onDelete={onDelete}
          onStar={onStar}
          onEdit={onEdit}
          onAddURL={onAddURL}
          onRemoveURL={onRemoveURL}
        />
      ))}
    </motion.div>
  );
}
