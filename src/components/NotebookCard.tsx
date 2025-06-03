"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/button";

export function NotebookCard({
  notebook,
  onDelete,
}: {
  notebook: { _id: string; title: string; createdAt: string };
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p- rounded-lg border bg-muted flex justify-between items-center"
    >
      <div>
        <h2 className="font-medium">{notebook.title}</h2>
        <p className="text-xs text-muted-foreground">
          {new Date(notebook.createdAt).toLocaleString()}
        </p>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(notebook._id)}
      >
        Delete
      </Button>
    </motion.div>
  );
}
