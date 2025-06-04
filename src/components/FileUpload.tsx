"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.summary) {
      // Encode summary and redirect to editor page
      const encoded = encodeURIComponent(data.summary);
      router.push(`/dashboard/imported?content=${encoded}`);
    } else {
      alert(data.error || "Failed to summarize file.");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        onChange={handleFileChange}
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Summarizing..." : "Upload & Summarize"}
      </button>
    </div>
  );
}
