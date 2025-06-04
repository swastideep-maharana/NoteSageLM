"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type SummaryStyle = "brief" | "detailed" | "key-points";
type SummaryLanguage = "en" | "es" | "fr" | "de" | "zh" | "ja";

interface EnhancedSummarizerProps {
  content: string;
  onSummaryGenerated: (summary: string) => void;
}

export function EnhancedSummarizer({
  content,
  onSummaryGenerated,
}: EnhancedSummarizerProps) {
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<SummaryStyle>("brief");
  const [language, setLanguage] = useState<SummaryLanguage>("en");
  const [length, setLength] = useState("medium");

  const getStylePrompt = (style: SummaryStyle): string => {
    switch (style) {
      case "brief":
        return "Create a concise summary focusing on the main points";
      case "detailed":
        return "Create a comprehensive summary with all important details";
      case "key-points":
        return "Extract and list the key points from the text";
      default:
        return "Create a summary";
    }
  };

  const getLengthPrompt = (length: string): string => {
    switch (length) {
      case "short":
        return "in 2-3 sentences";
      case "medium":
        return "in 4-6 sentences";
      case "long":
        return "in 8-10 sentences";
      default:
        return "";
    }
  };

  const generateSummary = async () => {
    setLoading(true);
    try {
      const prompt = `${getStylePrompt(style)} ${getLengthPrompt(length)}. Language: ${language}.\n\nText to summarize:\n${content}`;

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "summarize",
          content: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      onSummaryGenerated(data.result);
      toast.success("Summary generated successfully!");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">Enhanced Summary Options</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Summary Style
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as SummaryStyle)}
            className="w-full p-2 border rounded"
          >
            <option value="brief">Brief</option>
            <option value="detailed">Detailed</option>
            <option value="key-points">Key Points</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Length</label>
          <select
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SummaryLanguage)}
            className="w-full p-2 border rounded"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
          </select>
        </div>
      </div>

      <Button onClick={generateSummary} disabled={loading} className="w-full">
        {loading ? "Generating..." : "Generate Summary"}
      </Button>
    </div>
  );
}
