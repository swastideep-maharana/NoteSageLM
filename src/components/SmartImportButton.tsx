"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Notebook = {
  title: string;
  content: string;
};

type Props = {
  onNotebookCreated: (notebook: Notebook) => Promise<void>;
};

type ImportResponse = {
  message?: string;
  error?: string;
};

export function SmartImportButton({ onNotebookCreated }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const text = await file.text();

      // Try parsing the file as JSON with notebooks & notes arrays
      const data = JSON.parse(text);

      if (
        !data.notebooks ||
        !data.notes ||
        !Array.isArray(data.notebooks) ||
        !Array.isArray(data.notes)
      ) {
        alert("Invalid file format: missing notebooks or notes arrays.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/ai/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to import data.");
        setLoading(false);
        return;
      }

      const responseData: ImportResponse = await res.json();

      alert(responseData.message || "Import successful!");
    } catch (err) {
      alert("Error reading or importing file. Ensure it is valid JSON.");
      console.error(err);
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".json" // Changed to json to avoid confusion
        className="hidden"
        ref={fileRef}
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        disabled={loading}
        onClick={() => fileRef.current?.click()}
      >
        {loading ? "Importing..." : "Smart Import"}
      </Button>
    </>
  );
}
