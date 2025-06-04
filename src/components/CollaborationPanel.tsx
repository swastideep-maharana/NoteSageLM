"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { Share2, Users, Copy, Check } from "lucide-react";

interface CollaborationPanelProps {
  notebookId: string;
  onShare?: (email: string, permission: string) => void;
}

export default function CollaborationPanel({
  notebookId,
  onShare,
}: CollaborationPanelProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", role: "Editor" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Viewer" },
  ]);

  const handleShare = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      const response = await fetch("/api/notebooks/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebookId,
          email,
          permission,
        }),
      });

      if (!response.ok) throw new Error("Failed to share notebook");

      toast.success("Notebook shared successfully");
      setEmail("");
    } catch (error) {
      toast.error("Failed to share notebook");
    }
  };

  const generateShareLink = async () => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/share-link`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to generate share link");

      const data = await response.json();
      setShareLink(data.shareLink);
    } catch (error) {
      toast.error("Failed to generate share link");
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Share Notebook</CardTitle>
          <CardDescription>
            Invite others to collaborate on this notebook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="w-32 space-y-2">
              <Label htmlFor="permission">Permission</Label>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger>
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleShare} className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Share Link</CardTitle>
          <CardDescription>
            Generate a link to share this notebook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={shareLink}
              placeholder="Generate a share link"
              readOnly
            />
            <Button
              variant="outline"
              onClick={copyShareLink}
              disabled={!shareLink}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={generateShareLink}
            className="w-full"
          >
            Generate Link
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collaborators</CardTitle>
          <CardDescription>
            People who have access to this notebook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{collaborator.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {collaborator.email}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {collaborator.role}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
