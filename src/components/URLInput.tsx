"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, X } from "lucide-react";

interface URLInputProps {
  urls: string[];
  onAddURL: (url: string) => void;
  onRemoveURL: (url: string) => void;
}

export function URLInput({ urls, onAddURL, onRemoveURL }: URLInputProps) {
  const [newURL, setNewURL] = useState("");

  const handleAddURL = (e: React.FormEvent) => {
    e.preventDefault();
    if (newURL.trim()) {
      onAddURL(newURL.trim());
      setNewURL("");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddURL} className="flex gap-2">
        <Input
          type="url"
          value={newURL}
          onChange={(e) => setNewURL(e.target.value)}
          placeholder="Enter URL"
          className="flex-1"
        />
        <Button type="submit">
          <Link2 className="h-4 w-4 mr-2" />
          Add URL
        </Button>
      </form>

      {urls.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Added URLs:</p>
          <div className="space-y-2">
            {urls.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-md bg-muted"
              >
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {url}
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onRemoveURL(url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
