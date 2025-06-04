"use client";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  Panel,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./ui/label";
import { Brain, Download, RefreshCw, Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Share2, Bookmark, Clock } from "lucide-react";

interface MindMapProps {
  content: string;
}

const nodeTypes = {
  main: {
    style: {
      background: "#2563eb",
      color: "white",
      padding: 10,
      borderRadius: 5,
      width: 150,
    },
  },
  subtopic: {
    style: {
      background: "#3b82f6",
      color: "white",
      padding: 8,
      borderRadius: 4,
      width: 120,
    },
  },
  detail: {
    style: {
      background: "#60a5fa",
      color: "white",
      padding: 6,
      borderRadius: 3,
      width: 100,
    },
  },
};

const layoutOptions = [
  { value: "hierarchical", label: "Hierarchical" },
  { value: "force", label: "Force Directed" },
  { value: "radial", label: "Radial" },
];

export default function MindMap({ content }: MindMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [layout, setLayout] = useState("hierarchical");
  const [showSettings, setShowSettings] = useState(false);

  const generateMindMap = useCallback(async () => {
    if (!content) return;
    setLoading(true);

    try {
      const response = await fetch("/api/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate mind map");
      }

      // Transform the nodes to include positions
      const transformedNodes = data.nodes.map((node: any) => ({
        ...node,
        position: { x: 0, y: 0 }, // Initial position
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: nodeTypes[node.type as keyof typeof nodeTypes].style,
      }));

      // Layout the nodes based on selected layout
      const layoutedNodes = layoutNodes(transformedNodes, data.edges, layout);

      setNodes(layoutedNodes);
      setEdges(data.edges);
    } catch (error) {
      console.error("Error generating mind map:", error);
      toast.error("Failed to generate mind map");
    } finally {
      setLoading(false);
    }
  }, [content, setNodes, setEdges, layout]);

  // Layout nodes based on selected layout type
  const layoutNodes = (nodes: Node[], edges: Edge[], layoutType: string) => {
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const childrenMap = new Map<string, string[]>();

    // Build children map
    edges.forEach((edge) => {
      const children = childrenMap.get(edge.source) || [];
      children.push(edge.target);
      childrenMap.set(edge.source, children);
    });

    // Find root node
    const rootNode = nodes.find(
      (node) => !edges.some((edge) => edge.target === node.id)
    );

    if (!rootNode) return nodes;

    const layoutedNodes = [...nodes];
    const visited = new Set<string>();

    switch (layoutType) {
      case "hierarchical":
        positionNodeHierarchical(rootNode, 0, 0);
        break;
      case "radial":
        positionNodeRadial(rootNode, 0, 0);
        break;
      case "force":
        // Force-directed layout is handled by ReactFlow
        return nodes;
    }

    function positionNodeHierarchical(
      node: Node,
      level: number,
      index: number
    ) {
      if (visited.has(node.id)) return;
      visited.add(node.id);

      const nodeIndex = layoutedNodes.findIndex((n) => n.id === node.id);
      if (nodeIndex !== -1) {
        layoutedNodes[nodeIndex] = {
          ...layoutedNodes[nodeIndex],
          position: {
            x: level * 200,
            y: index * 100,
          },
        };
      }

      const children = childrenMap.get(node.id) || [];
      children.forEach((childId, childIndex) => {
        const childNode = nodeMap.get(childId);
        if (childNode) {
          positionNodeHierarchical(childNode, level + 1, childIndex);
        }
      });
    }

    function positionNodeRadial(node: Node, angle: number, radius: number) {
      if (visited.has(node.id)) return;
      visited.add(node.id);

      const nodeIndex = layoutedNodes.findIndex((n) => n.id === node.id);
      if (nodeIndex !== -1) {
        layoutedNodes[nodeIndex] = {
          ...layoutedNodes[nodeIndex],
          position: {
            x: Math.cos(angle) * radius * 100,
            y: Math.sin(angle) * radius * 100,
          },
        };
      }

      const children = childrenMap.get(node.id) || [];
      const angleStep = (2 * Math.PI) / children.length;
      children.forEach((childId, childIndex) => {
        const childNode = nodeMap.get(childId);
        if (childNode) {
          positionNodeRadial(
            childNode,
            angle + childIndex * angleStep,
            radius + 1
          );
        }
      });
    }

    return layoutedNodes;
  };

  const handleExport = () => {
    const svg = document.querySelector(".react-flow__viewport svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = "mindmap.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  useEffect(() => {
    generateMindMap();
  }, [generateMindMap]);

  return (
    <Card className="p-4">
      <div className="w-full h-[600px] relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
          <Panel position="top-right" className="flex gap-2">
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mind Map Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Layout</Label>
                    <Select
                      value={layout}
                      onValueChange={(value) => {
                        setLayout(value);
                        generateMindMap();
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select layout" />
                      </SelectTrigger>
                      <SelectContent>
                        {layoutOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              onClick={generateMindMap}
              disabled={loading}
              variant="outline"
              size="icon"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button onClick={handleExport} variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </Panel>
        </ReactFlow>
      </div>
    </Card>
  );
}
