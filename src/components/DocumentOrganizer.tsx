"use client";

import { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import { toast } from "react-hot-toast";
import { Folder, Document } from "@/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FolderIcon, PlusIcon, SearchIcon } from "lucide-react";
import { DraggableDocument } from "./DraggableDocument";

interface DocumentOrganizerProps {
  onDocumentSelect: (document: Document) => void;
}

export function DocumentOrganizer({
  onDocumentSelect,
}: DocumentOrganizerProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  useEffect(() => {
    fetchFolders();
    fetchDocuments();
  }, [selectedFolder, searchQuery]);

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      if (!response.ok) throw new Error("Failed to fetch folders");
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error("Failed to fetch folders");
    }
  };

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedFolder) params.append("folderId", selectedFolder);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/documents?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch documents");
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to fetch documents");
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name is required");
      return;
    }

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName,
          parentId: selectedFolder,
        }),
      });

      if (!response.ok) throw new Error("Failed to create folder");
      await fetchFolders();
      setNewFolderName("");
      setIsCreatingFolder(false);
      toast.success("Folder created successfully");
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  };

  const handleMoveDocument = async (
    documentId: string,
    folderId: string | null
  ) => {
    try {
      const response = await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: documentId,
          folderId,
        }),
      });

      if (!response.ok) throw new Error("Failed to move document");
      await fetchDocuments();
      toast.success("Document moved successfully");
    } catch (error) {
      console.error("Error moving document:", error);
      toast.error("Failed to move document");
    }
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "document",
    drop: (item: { id: string }) => {
      handleMoveDocument(item.id, selectedFolder);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const renderFolderTree = (parentId: string | null = null, level = 0) => {
    return folders
      .filter((folder) => folder.parentId === parentId)
      .map((folder) => (
        <div key={folder._id} style={{ marginLeft: `${level * 20}px` }}>
          <div
            className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 rounded ${
              selectedFolder === folder._id ? "bg-gray-100" : ""
            }`}
            onClick={() => setSelectedFolder(folder._id)}
          >
            <FolderIcon className="w-4 h-4 mr-2" />
            <span>{folder.name}</span>
          </div>
          {renderFolderTree(folder._id, level + 1)}
        </div>
      ));
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r p-4">
        <div className="mb-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsCreatingFolder(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Folder
          </Button>
        </div>

        {isCreatingFolder && (
          <div className="mb-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="mb-2"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateFolder}>Create</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div
            className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 rounded ${
              selectedFolder === null ? "bg-gray-100" : ""
            }`}
            onClick={() => setSelectedFolder(null)}
          >
            <FolderIcon className="w-4 h-4 mr-2" />
            <span>All Documents</span>
          </div>
          {renderFolderTree()}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="mb-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="pl-10"
            />
          </div>
        </div>

        <div
          ref={drop}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${
            isOver ? "bg-gray-100" : ""
          }`}
        >
          {documents.map((doc) => (
            <DraggableDocument
              key={doc._id}
              document={doc}
              onClick={onDocumentSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
