"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Send,
  Trash2,
  Download,
  Star,
  StarOff,
  FileText,
  Brain,
  History,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { AssistantNav } from "@/components/assistant/assistant-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  isFavorite?: boolean;
}

const AI_MODELS = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  { id: "claude-3", name: "Claude 3" },
];

export default function AssistantPage() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(
    null
  );
  const [currentMode, setCurrentMode] = useState("chat");
  const [notebookContent, setNotebookContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load conversations from localStorage
    const savedConversations = localStorage.getItem("aiConversations");
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Save conversations to localStorage
    localStorage.setItem("aiConversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          model: selectedModel,
          conversationId: currentConversation,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update or create conversation
      if (currentConversation) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversation
              ? {
                  ...conv,
                  messages: [...conv.messages, userMessage, assistantMessage],
                }
              : conv
          )
        );
      } else {
        const newConversation: Conversation = {
          id: Date.now().toString(),
          title: userMessage.content.slice(0, 30) + "...",
          messages: [userMessage, assistantMessage],
          model: selectedModel,
          createdAt: new Date(),
        };
        setConversations((prev) => [...prev, newConversation]);
        setCurrentConversation(newConversation.id);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get response from AI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setCurrentConversation(null);
  };

  const handleLoadConversation = (conversationId: string) => {
    const conversation = conversations.find(
      (conv) => conv.id === conversationId
    );
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConversation(conversationId);
      setSelectedModel(conversation.model);
    }
  };

  const handleDeleteConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.filter((conv) => conv.id !== conversationId)
    );
    if (currentConversation === conversationId) {
      setMessages([]);
      setCurrentConversation(null);
    }
  };

  const handleToggleFavorite = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, isFavorite: !conv.isFavorite }
          : conv
      )
    );
  };

  const handleExportConversation = () => {
    if (!currentConversation) return;

    const conversation = conversations.find(
      (conv) => conv.id === currentConversation
    );
    if (!conversation) return;

    const exportData = {
      title: conversation.title,
      model: conversation.model,
      messages: conversation.messages,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${conversation.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    switch (currentMode) {
      case "chat":
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentConversation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportConversation}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <Card
                      className={`max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="flex items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        );

      case "notebook":
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Notebook</h2>
              <Button variant="outline" size="sm">
                Save
              </Button>
            </div>
            <Textarea
              value={notebookContent}
              onChange={(e) => setNotebookContent(e.target.value)}
              placeholder="Write your notes here..."
              className="min-h-[500px]"
            />
          </div>
        );

      case "brain":
        return (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">AI Brain</h2>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Knowledge Base</h3>
                  <p className="text-sm text-muted-foreground">
                    Your AI's accumulated knowledge and insights
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Learning Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Track how your AI learns and improves
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "history":
        return (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Conversation History</h2>
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <Card key={conversation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{conversation.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            conversation.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFavorite(conversation.id)}
                        >
                          {conversation.isFavorite ? (
                            <Star className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDeleteConversation(conversation.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "favorites":
        return (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Favorite Conversations
            </h2>
            <div className="space-y-2">
              {conversations
                .filter((conv) => conv.isFavorite)
                .map((conversation) => (
                  <Card key={conversation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{conversation.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              conversation.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleToggleFavorite(conversation.id)
                            }
                          >
                            <Star className="h-4 w-4 text-yellow-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleLoadConversation(conversation.id)
                            }
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Assistant Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Default AI Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select default model" />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Auto-save Conversations</Label>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="autoSave" defaultChecked />
                  <label htmlFor="autoSave" className="text-sm">
                    Automatically save conversations
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <AssistantNav onModeChange={setCurrentMode} currentMode={currentMode} />
      <div className="flex-1 overflow-auto">
        <div className="container max-w-6xl py-6 h-full">{renderContent()}</div>
      </div>
    </div>
  );
}
