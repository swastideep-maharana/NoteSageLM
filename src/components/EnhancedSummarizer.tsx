"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type SummaryStyle = "brief" | "detailed" | "key-points";
type SummaryLanguage =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "ru"
  | "zh"
  | "ja"
  | "ko";

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
    if (!content.trim()) {
      toast.error("Please add some content to summarize");
      return;
    }

    setLoading(true);
    try {
      const prompt = `${getStylePrompt(style)} ${getLengthPrompt(length)}. Language: ${language}.\n\nText to summarize:\n${content}`;

      const response = await fetch("/api/ai/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "summarize",
          content: prompt,
          options: {
            type: style,
            length,
            language,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate summary");
      }

      const data = await response.json();
      onSummaryGenerated(data.summary || data.result);
      toast.success("Summary generated successfully!");
    } catch (error: any) {
      console.error("Error generating summary:", error);
      toast.error(error.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Enhanced Summary
        </CardTitle>
        <CardDescription>
          Generate a customized summary with different styles, lengths, and
          languages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style">Summary Style</Label>
              <Select
                value={style}
                onValueChange={(value: SummaryStyle) => setStyle(value)}
              >
                <SelectTrigger id="style">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="key-points">Key Points</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Summary Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger id="length">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={language}
                onValueChange={(value: SummaryLanguage) => setLanguage(value)}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                  <SelectItem value="ru">Russian</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="ko">Korean</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generateSummary}
            disabled={loading || !content.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Summary
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
