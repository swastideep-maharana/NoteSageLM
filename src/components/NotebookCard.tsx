"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { URLInput } from "@/components/URLInput";
import { Star, MoreVertical, Pencil, Trash2, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notebook {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  type?: string;
  isStarred?: boolean;
  urls?: string[];
  createdAt: string;
  updatedAt: string;
}

interface NotebookCardProps {
  notebook: Notebook;
  onDelete: (id: string) => void;
  onStar?: (id: string) => void;
  onEdit?: (id: string) => void;
  onAddURL?: (id: string, url: string) => void;
  onRemoveURL?: (id: string, url: string) => void;
}

export function NotebookCard({
  notebook,
  onDelete,
  onStar,
  onEdit,
  onAddURL,
  onRemoveURL,
}: NotebookCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showURLInput, setShowURLInput] = useState(false);
  const router = useRouter();

  const handleEdit = () => {
    if (onEdit) {
      onEdit(notebook._id);
    } else {
      router.push(`/notebook/${notebook._id}/edit`);
    }
  };

  const handleStar = () => {
    if (onStar) {
      onStar(notebook._id);
    }
  };

  const handleAddURL = (url: string) => {
    if (onAddURL) {
      onAddURL(notebook._id, url);
    }
  };

  const handleRemoveURL = (url: string) => {
    if (onRemoveURL) {
      onRemoveURL(notebook._id, url);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{notebook.title}</h3>
          {notebook.description && (
            <p className="text-sm text-muted-foreground">
              {notebook.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{new Date(notebook.createdAt).toLocaleDateString()}</span>
            {notebook.type && (
              <>
                <span>•</span>
                <span className="capitalize">{notebook.type}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onStar && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleStar}
            >
              <Star
                className={`h-4 w-4 ${
                  notebook.isStarred ? "fill-yellow-400 text-yellow-400" : ""
                }`}
              />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onAddURL && (
                <DropdownMenuItem
                  onClick={() => setShowURLInput(!showURLInput)}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Add URL
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(notebook._id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {showURLInput && onAddURL && (
        <div className="pt-2">
          <URLInput
            urls={notebook.urls || []}
            onAddURL={handleAddURL}
            onRemoveURL={handleRemoveURL}
          />
        </div>
      )}

      {notebook.urls && notebook.urls.length > 0 && !showURLInput && (
        <div className="flex flex-wrap gap-2">
          {notebook.urls.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {url}
            </a>
          ))}
        </div>
      )}

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "Show Less" : "Show More"}
      </Button>

      {isExpanded && (
        <div className="space-y-4 pt-4 border-t">
          {notebook.content && (
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: notebook.content }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
