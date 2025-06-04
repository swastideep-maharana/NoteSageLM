"use client";

import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Plus, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface KanbanCard {
  id: string;
  title: string;
  content: string;
  status: "todo" | "in-progress" | "done";
  tags: string[];
}

interface KanbanBoardProps {
  notebookId: string;
}

export default function KanbanBoard({ notebookId }: KanbanBoardProps) {
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKanbanCards();
  }, [notebookId]);

  const fetchKanbanCards = async () => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/kanban`);
      if (!response.ok) throw new Error("Failed to fetch kanban cards");
      const data = await response.json();
      setCards(data.cards);
    } catch (error) {
      console.error("Error fetching kanban cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("cardId", cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (
    e: React.DragEvent,
    newStatus: KanbanCard["status"]
  ) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");

    try {
      const response = await fetch(
        `/api/notebooks/${notebookId}/kanban/${cardId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Failed to update card status");

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId ? { ...card, status: newStatus } : card
        )
      );
    } catch (error) {
      console.error("Error updating card status:", error);
    }
  };

  const addNewCard = async (status: KanbanCard["status"]) => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/kanban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Card",
          content: "",
          status,
          tags: [],
        }),
      });

      if (!response.ok) throw new Error("Failed to create new card");

      const newCard = await response.json();
      setCards((prevCards) => [...prevCards, newCard]);
    } catch (error) {
      console.error("Error creating new card:", error);
    }
  };

  if (loading) {
    return <div>Loading kanban board...</div>;
  }

  const columns = [
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  return (
    <div className="flex gap-4 h-[600px]">
      {columns.map((column) => (
        <Card key={column.id} className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{column.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => addNewCard(column.id as KanbanCard["status"])}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100%-3rem)]">
            <div
              className="space-y-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id as KanbanCard["status"])}
            >
              {cards
                .filter((card) => card.status === column.id)
                .map((card) => (
                  <div
                    key={card.id}
                    className="bg-white rounded-lg shadow p-4 cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{card.title}</h4>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-gray-600">{card.content}</p>
                    {card.tags.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {card.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </ScrollArea>
        </Card>
      ))}
    </div>
  );
}
