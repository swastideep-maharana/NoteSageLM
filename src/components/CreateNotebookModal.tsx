"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { URLInput } from "@/components/URLInput";
import { FileUpload } from "@/components/FileUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, FileText, Link2, Brain, Map } from "lucide-react";

interface CreateNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    type: string;
    urls: string[];
    files: File[];
    aiOptions: {
      summarize: boolean;
      mindmap: boolean;
      roadmap: boolean;
    };
  }) => void;
}

export function CreateNotebookModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateNotebookModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("note");
  const [urls, setUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [aiOptions, setAiOptions] = useState({
    summarize: false,
    mindmap: false,
    roadmap: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      type,
      urls,
      files,
      aiOptions,
    });
    // Reset form
    setTitle("");
    setDescription("");
    setType("note");
    setUrls([]);
    setFiles([]);
    setAiOptions({
      summarize: false,
      mindmap: false,
      roadmap: false,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Notebook</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notebook title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter notebook description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">
                <FileText className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="urls">
                <Link2 className="h-4 w-4 mr-2" />
                URLs
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Brain className="h-4 w-4 mr-2" />
                AI Options
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="space-y-4">
              <FileUpload
                files={files}
                onChange={setFiles}
                accept=".pdf,.doc,.docx,.txt"
                maxFiles={5}
              />
            </TabsContent>
            <TabsContent value="urls" className="space-y-4">
              <URLInput
                urls={urls}
                onAddURL={(url) => setUrls([...urls, url])}
                onRemoveURL={(url) => setUrls(urls.filter((u) => u !== url))}
              />
            </TabsContent>
            <TabsContent value="ai" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="summarize"
                    checked={aiOptions.summarize}
                    onChange={(e) =>
                      setAiOptions({
                        ...aiOptions,
                        summarize: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="summarize">Generate Summary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mindmap"
                    checked={aiOptions.mindmap}
                    onChange={(e) =>
                      setAiOptions({ ...aiOptions, mindmap: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="mindmap">Generate Mind Map</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="roadmap"
                    checked={aiOptions.roadmap}
                    onChange={(e) =>
                      setAiOptions({ ...aiOptions, roadmap: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="roadmap">Generate Roadmap</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Create Notebook
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
