"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  FileText,
  Settings,
  Brain,
  History,
  Star,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AssistantNavProps {
  onModeChange: (mode: string) => void;
  currentMode: string;
}

const modes = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "notebook", label: "Notebook", icon: FileText },
  { id: "brain", label: "AI Brain", icon: Brain },
  { id: "history", label: "History", icon: History },
  { id: "favorites", label: "Favorites", icon: Star },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AssistantNav({ onModeChange, currentMode }: AssistantNavProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={cn(
        "h-full border-r bg-background transition-all duration-300",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          {isExpanded ? (
            <h2 className="text-lg font-semibold">Assistant</h2>
          ) : (
            <Brain className="h-6 w-6" />
          )}
        </div>
        <div className="flex-1 overflow-auto py-2">
          <div className="space-y-1 px-2">
            {modes.map((mode) => (
              <Button
                key={mode.id}
                variant={currentMode === mode.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isExpanded ? "px-4" : "px-2"
                )}
                onClick={() => onModeChange(mode.id)}
              >
                <mode.icon className="h-5 w-5" />
                {isExpanded && <span className="ml-2">{mode.label}</span>}
              </Button>
            ))}
          </div>
        </div>
        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Plus
              className={cn(
                "h-5 w-5 transition-transform",
                isExpanded ? "rotate-45" : ""
              )}
            />
            {isExpanded && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
