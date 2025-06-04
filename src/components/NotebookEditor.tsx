"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { useState, useCallback, KeyboardEvent } from "react";
import { toast } from "sonner";
import MindMap from "./MindMap";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Save, Sparkles, Wand2, Brain, Plus, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NotebookEditorProps = {
  content: string;
  notebookId: string;
  initialTags?: string[];
};

export default function NotebookEditor({
  content,
  notebookId,
  initialTags = [],
}: NotebookEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");
  const [showMindMap, setShowMindMap] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your notes here...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      saveContent(content);
    },
  });

  const saveContent = useCallback(
    async (newContent?: string) => {
      if (!editor) return;
      setIsSaving(true);

      try {
        const res = await fetch(`/api/notebooks/${notebookId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newContent || editor.getHTML(),
            tags,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to save");
        }
        toast.success("Changes saved successfully");
      } catch (error) {
        console.error("Save error:", error);
        toast.error("Failed to save changes");
      } finally {
        setIsSaving(false);
      }
    },
    [editor, notebookId, tags]
  );

  const handleManualSave = () => {
    if (!editor) return;
    saveContent();
  };

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleAI = useCallback(
    async (type: "summarize" | "generate") => {
      if (!editor) return;
      setLoadingAI(true);

      try {
        const plainText = editor.getText();
        if (!plainText.trim()) {
          toast.error("Please add some content before using AI features");
          return;
        }

        const res = await fetch("/api/ai/features", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            content: plainText,
            options: {
              type: "detailed",
              length: "medium",
            },
          }),
        });

        const data = await res.json();

        if (res.ok && data) {
          if (type === "summarize") {
            // For summarize, we want to preserve the original content and add the summary
            const currentContent = editor.getHTML();
            const summaryContent = `<div class="ai-summary">
              <h3>AI Summary</h3>
              <p>${data.summary || data.result}</p>
              ${data.keyPoints ? `<h4>Key Points:</h4><ul>${data.keyPoints.map((point: string) => `<li>${point}</li>`).join("")}</ul>` : ""}
            </div>`;
            editor.commands.setContent(currentContent + summaryContent);
          } else {
            // For generate, replace the content
            editor.commands.setContent(data.result);
          }
          await saveContent();
          toast.success(
            `${type === "summarize" ? "Summarized" : "Generated"} successfully.`
          );
        } else {
          toast.error(data.error || "AI error occurred.");
        }
      } catch (error) {
        console.error("AI feature error:", error);
        toast.error("Network error calling AI.");
      } finally {
        setLoadingAI(false);
      }
    },
    [editor, saveContent]
  );

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <EditorContent
          editor={editor}
          className="prose prose-sm dark:prose-invert max-w-none min-h-[400px] focus:outline-none"
        />
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => removeTag(idx)}
                >
                  {tag}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tags (press enter or comma)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                    setTags([...tags, tagInput.trim()]);
                    setTagInput("");
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleManualSave}
                    disabled={isSaving || loadingAI}
                    variant="outline"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save your changes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleAI("summarize")}
                    disabled={loadingAI || isSaving}
                    variant="outline"
                    className="bg-blue-50 hover:bg-blue-100"
                  >
                    {loadingAI ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Summarize
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate a detailed summary with key points</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleAI("generate")}
                    disabled={loadingAI || isSaving}
                    variant="outline"
                    className="bg-purple-50 hover:bg-purple-100"
                  >
                    {loadingAI ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate new content based on your notes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowMindMap(!showMindMap)}
                    variant="outline"
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    {showMindMap ? "Hide Mind Map" : "Show Mind Map"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visualize your notes as a mind map</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card>

      {showMindMap && (
        <Card className="p-4">
          <MindMap content={editor?.getText() || ""} />
        </Card>
      )}
    </div>
  );
}
