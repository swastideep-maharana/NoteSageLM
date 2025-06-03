"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "./ui/button";

type Notebook = {
  _id: string;
  title: string;
  createdAt: string;
  tags?: string[];
};

export function NotebookCard({
  notebook,
  onDelete,
}: {
  notebook: Notebook;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      layout
      className="p-4 rounded-lg border bg-muted flex justify-between items-center hover:shadow transition"
    >
      <Link href={`/notebook/${notebook._id}`} className="flex-1">
        <div>
          <h2 className="font-medium text-base hover:underline">
            {notebook.title}
          </h2>
          <p className="text-xs text-muted-foreground">
            {new Date(notebook.createdAt).toLocaleString()}
          </p>
          {notebook.tags && notebook.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {notebook.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-300 text-gray-800 rounded-full px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(notebook._id)}
        className="ml-4"
      >
        Delete
      </Button>
    </motion.div>
  );
}
