"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Youtube } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Download, Share2, Bookmark, Clock } from "lucide-react";
import { Badge } from "./ui/badge";

interface VideoInfo {
  title: string;
  channel: string;
  duration: string;
  views: string;
  publishedAt: string;
  description: string;
  chapters: { time: string; title: string }[];
}

interface Summary {
  summary: string;
  keyPoints: string[];
  mainTopics: string[];
  timestamps: { time: string; description: string }[];
  actionItems: string[];
  relatedTopics: string[];
  videoInfo: VideoInfo;
}

export default function YouTubeSummarizer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [exportFormat, setExportFormat] = useState("markdown");

  const extractVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleSummarize = async () => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    setLoading(true);
    try {
      // First, get video info and transcript
      const [infoResponse, transcriptResponse] = await Promise.all([
        fetch(`/api/youtube/info?videoId=${videoId}`),
        fetch(`/api/youtube/transcript?videoId=${videoId}`),
      ]);

      if (!infoResponse.ok || !transcriptResponse.ok) {
        throw new Error("Failed to fetch video data");
      }

      const [videoInfo, { transcript }] = await Promise.all([
        infoResponse.json(),
        transcriptResponse.json(),
      ]);

      if (!transcript) {
        throw new Error("No transcript available for this video");
      }

      // Then, use our AI to summarize the transcript
      const summaryResponse = await fetch("/api/ai/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "youtube-summarize",
          content: transcript,
          options: { videoInfo },
        }),
      });

      if (!summaryResponse.ok) {
        const errorData = await summaryResponse.json();
        throw new Error(errorData.error || "Failed to generate summary");
      }

      const summaryData = await summaryResponse.json();
      setSummary({ ...summaryData, videoInfo });
      toast.success("Summary generated successfully!");
    } catch (error: any) {
      console.error("Error summarizing video:", error);
      toast.error(error.message || "Failed to summarize video");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!summary) return;

    let content = "";
    switch (exportFormat) {
      case "markdown":
        content = generateMarkdownExport(summary);
        break;
      case "json":
        content = JSON.stringify(summary, null, 2);
        break;
      case "text":
        content = generateTextExport(summary);
        break;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary-${summary.videoInfo.title}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateMarkdownExport = (summary: Summary) => {
    return `# ${summary.videoInfo.title}

## Video Information
- Channel: ${summary.videoInfo.channel}
- Duration: ${summary.videoInfo.duration}
- Views: ${summary.videoInfo.views}
- Published: ${summary.videoInfo.publishedAt}

## Summary
${summary.summary}

## Key Points
${summary.keyPoints.map((point) => `- ${point}`).join("\n")}

## Main Topics
${summary.mainTopics.map((topic) => `- ${topic}`).join("\n")}

## Important Moments
${summary.timestamps.map((ts) => `- ${ts.time}: ${ts.description}`).join("\n")}

## Action Items
${summary.actionItems.map((item) => `- ${item}`).join("\n")}

## Related Topics
${summary.relatedTopics.map((topic) => `- ${topic}`).join("\n")}
`;
  };

  const generateTextExport = (summary: Summary) => {
    return `Video: ${summary.videoInfo.title}
Channel: ${summary.videoInfo.channel}
Duration: ${summary.videoInfo.duration}
Views: ${summary.videoInfo.views}
Published: ${summary.videoInfo.publishedAt}

SUMMARY
${summary.summary}

KEY POINTS
${summary.keyPoints.join("\n")}

MAIN TOPICS
${summary.mainTopics.join("\n")}

IMPORTANT MOMENTS
${summary.timestamps.map((ts) => `${ts.time}: ${ts.description}`).join("\n")}

ACTION ITEMS
${summary.actionItems.join("\n")}

RELATED TOPICS
${summary.relatedTopics.join("\n")}
`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-6 w-6 text-red-500" />
            YouTube Video Summarizer
          </CardTitle>
          <CardDescription>
            Enter a YouTube video URL to generate a comprehensive summary with
            key points, timestamps, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube Video URL</Label>
              <div className="flex gap-2">
                <Input
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleSummarize}
                  disabled={loading || !url.trim()}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Summarize"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Video Summary</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Export as" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleExport} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="key-points">Key Points</TabsTrigger>
                <TabsTrigger value="timestamps">Timestamps</TabsTrigger>
                <TabsTrigger value="topics">Topics</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold">Summary</h3>
                  <p className="text-gray-600">{summary.summary}</p>
                  <h3 className="text-lg font-semibold mt-4">Action Items</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {summary.actionItems.map((item, index) => (
                      <li key={index} className="text-gray-600">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="key-points">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-4">Key Points</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {summary.keyPoints.map((point, index) => (
                      <li key={index} className="text-gray-600">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="timestamps">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-4">
                    Important Moments
                  </h3>
                  <ul className="space-y-2">
                    {summary.timestamps.map((ts, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-1">
                          {ts.time}
                        </Badge>
                        <span className="text-gray-600">{ts.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="topics">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-4">Main Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.mainTopics.map((topic, index) => (
                      <Badge key={index} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold mt-6 mb-4">
                    Related Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.relatedTopics.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
