"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Tag {
  name: string;
  parent?: string;
  count?: number;
}

interface SmartTaggerProps {
  content: string;
  initialTags?: string[];
  onTagsUpdate: (tags: string[]) => void;
}

export function SmartTagger({
  content,
  initialTags = [],
  onTagsUpdate,
}: SmartTaggerProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    generateTagSuggestions();
  }, [content]);

  const generateTagSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "suggest-tags",
          content: content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate tag suggestions");
      }

      const data = await response.json();
      setSuggestedTags(data.tags || []);
    } catch (error) {
      console.error("Error generating tag suggestions:", error);
      toast.error("Failed to generate tag suggestions");
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    const normalizedTag = tag.trim().toLowerCase();
    if (!tags.includes(normalizedTag)) {
      const newTags = [...tags, normalizedTag];
      setTags(newTags);
      onTagsUpdate(newTags);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    onTagsUpdate(newTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(newTag);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">Smart Tags</h3>

      {/* Current Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Add New Tag */}
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Add a tag (press Enter or comma)"
          className="flex-1"
        />
        <Button onClick={() => addTag(newTag)}>Add</Button>
      </div>

      {/* Suggested Tags */}
      {suggestedTags.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Suggested Tags</h4>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <button
                key={tag.name}
                onClick={() => addTag(tag.name)}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {tag.name}
                {tag.count && (
                  <span className="text-gray-500 ml-1">({tag.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Suggestions */}
      <Button
        onClick={generateTagSuggestions}
        disabled={loading}
        variant="outline"
        className="w-full"
      >
        {loading ? "Generating..." : "Refresh Suggestions"}
      </Button>
    </div>
  );
}
