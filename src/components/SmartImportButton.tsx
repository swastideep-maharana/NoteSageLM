"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Props {
  onNotebookCreated: (notebook: { title: string; content: string }) => void;
}

interface ImportResponse {
  message: string;
}

export function SmartImportButton({ onNotebookCreated }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const convertToNotebookFormat = (
    content: string,
    filename: string
  ): { notebooks: any[]; notes: any[] } => {
    // Create a notebook with the filename as title
    const notebook = {
      title: filename.split(".")[0] || "Imported Document",
      content: content,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create a note with the content
    const note = {
      title: "Main Note",
      content: content,
      notebookTitle: notebook.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      notebooks: [notebook],
      notes: [note],
    };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const text = await file.text();
      let data;

      try {
        // First try parsing as JSON
        data = JSON.parse(text);

        // If it's already in the correct format, use it as is
        if (
          data.notebooks &&
          data.notes &&
          Array.isArray(data.notebooks) &&
          Array.isArray(data.notes)
        ) {
          // Data is already in the correct format
        } else {
          // Convert the JSON data into the required format
          data = convertToNotebookFormat(text, file.name);
        }
      } catch {
        // If JSON parsing fails, treat it as plain text
        data = convertToNotebookFormat(text, file.name);
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

      // Notify parent component about the new notebook
      if (data.notebooks && data.notebooks.length > 0) {
        const notebook = {
          title: data.notebooks[0].title,
          content: data.notebooks[0].content,
        };
        onNotebookCreated(notebook);

        // Trigger AI summarization
        try {
          const summaryRes = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "summarize",
              content: notebook.content,
            }),
          });

          if (!summaryRes.ok) {
            throw new Error("Failed to generate summary");
          }

          const summaryData = await summaryRes.json();

          // Redirect to the imported page with the summary
          router.push(
            `/dashboard/imported?content=${encodeURIComponent(summaryData.result)}`
          );
        } catch (error) {
          console.error("Error generating summary:", error);
          alert(
            "Document imported successfully, but failed to generate summary. You can try summarizing it manually."
          );
          router.push("/dashboard");
        }
      }
    } catch (err) {
      alert("Error reading or importing file. Please try again.");
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
        accept=".json,.txt,.md,.doc,.docx,.pdf"
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
