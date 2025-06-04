"use client";

import { useState } from "react";
import { Button } from "./ui/button";

type ImportButtonProps = {
  onImport: (data: any) => void;
};

export function ImportButton({ onImport }: ImportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      onImport(data);
    } catch (err) {
      alert("Invalid JSON file");
    }
    setLoading(false);
    e.target.value = ""; // reset input
  };

  return (
    <>
      <input
        id="import-file"
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <label htmlFor="import-file" style={{ cursor: "pointer" }}>
        <Button disabled={loading}>
          {loading ? "Importing..." : "Import"}
        </Button>
      </label>
    </>
  );
}
