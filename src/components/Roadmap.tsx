"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Map } from "lucide-react";
import { toast } from "sonner";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";

interface RoadmapData {
  mainGoal: string;
  phases: {
    name: string;
    duration: string;
    milestones: string[];
    resources: string[];
  }[];
  dependencies: { from: string; to: string }[];
  metrics: string[];
  risks: { description: string; mitigation: string }[];
}

interface VisualizationOptions {
  layout: "hierarchical" | "force" | "radial" | "dagre";
  theme: "light" | "dark" | "colorful";
  showLabels: boolean;
  showMiniMap: boolean;
  showControls: boolean;
  nodeSpacing: number;
}

export default function Roadmap() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [visualizationOptions, setVisualizationOptions] =
    useState<VisualizationOptions>({
      layout: "hierarchical",
      theme: "light",
      showLabels: true,
      showMiniMap: true,
      showControls: true,
      nodeSpacing: 100,
    });

  const generateRoadmap = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "roadmap",
          content: topic,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate roadmap");
      const data = await response.json();
      setRoadmapData(data);
      generateMindMap(data);
      toast.success("Roadmap generated successfully!");
    } catch (error) {
      console.error("Error generating roadmap:", error);
      toast.error("Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  const generateMindMap = (data: RoadmapData) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Add main goal node with theme-based styling
    const goalStyle = getNodeStyle("goal", visualizationOptions.theme);
    newNodes.push({
      id: "goal",
      data: { label: data.mainGoal },
      position: { x: 0, y: 0 },
      style: goalStyle,
    });

    // Calculate node positions based on selected layout
    const positions = calculateNodePositions(data, visualizationOptions);

    // Add phase nodes
    data.phases.forEach((phase, index) => {
      const phaseId = `phase-${index}`;
      const phaseStyle = getNodeStyle("phase", visualizationOptions.theme);
      newNodes.push({
        id: phaseId,
        data: { label: `${phase.name}\n(${phase.duration})` },
        position: positions.phases[index],
        style: phaseStyle,
      });

      // Connect phase to goal with animated edge
      newEdges.push({
        id: `goal-${phaseId}`,
        source: "goal",
        target: phaseId,
        animated: true,
        style: getEdgeStyle(visualizationOptions.theme),
      });

      // Add milestone nodes
      phase.milestones.forEach((milestone, mIndex) => {
        const milestoneId = `${phaseId}-milestone-${mIndex}`;
        const milestoneStyle = getNodeStyle(
          "milestone",
          visualizationOptions.theme
        );
        newNodes.push({
          id: milestoneId,
          data: { label: milestone },
          position: positions.milestones[phaseId][mIndex],
          style: milestoneStyle,
        });

        // Connect milestone to phase
        newEdges.push({
          id: `${phaseId}-${milestoneId}`,
          source: phaseId,
          target: milestoneId,
          style: getEdgeStyle(visualizationOptions.theme),
        });
      });
    });

    // Add dependency edges with custom styling
    data.dependencies.forEach((dep, index) => {
      newEdges.push({
        id: `dep-${index}`,
        source: dep.from,
        target: dep.to,
        style: getDependencyEdgeStyle(visualizationOptions.theme),
        animated: true,
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const getNodeStyle = (
    type: "goal" | "phase" | "milestone",
    theme: string
  ) => {
    const baseStyle = {
      padding: 10,
      borderRadius: 5,
      fontSize: 14,
      fontWeight: 500,
    };

    const themes = {
      light: {
        goal: { background: "#4f46e5", color: "white" },
        phase: { background: "#818cf8", color: "white" },
        milestone: { background: "#c7d2fe", color: "#1f2937" },
      },
      dark: {
        goal: { background: "#1e1b4b", color: "white" },
        phase: { background: "#312e81", color: "white" },
        milestone: { background: "#4338ca", color: "white" },
      },
      colorful: {
        goal: { background: "#7c3aed", color: "white" },
        phase: { background: "#4f46e5", color: "white" },
        milestone: { background: "#2563eb", color: "white" },
      },
    };

    return { ...baseStyle, ...themes[theme][type] };
  };

  const getEdgeStyle = (theme: string) => {
    const themes = {
      light: { stroke: "#94a3b8", strokeWidth: 2 },
      dark: { stroke: "#475569", strokeWidth: 2 },
      colorful: { stroke: "#818cf8", strokeWidth: 2 },
    };
    return themes[theme];
  };

  const getDependencyEdgeStyle = (theme: string) => {
    const themes = {
      light: { stroke: "#ef4444", strokeWidth: 2, strokeDasharray: "5,5" },
      dark: { stroke: "#dc2626", strokeWidth: 2, strokeDasharray: "5,5" },
      colorful: { stroke: "#f43f5e", strokeWidth: 2, strokeDasharray: "5,5" },
    };
    return themes[theme];
  };

  const calculateNodePositions = (
    data: RoadmapData,
    options: VisualizationOptions
  ) => {
    const positions = {
      phases: [] as { x: number; y: number }[],
      milestones: {} as Record<string, { x: number; y: number }[]>,
    };

    switch (options.layout) {
      case "hierarchical":
        // Hierarchical layout calculation
        data.phases.forEach((phase, index) => {
          positions.phases.push({
            x: -300 + index * 200,
            y: 100,
          });
          positions.milestones[`phase-${index}`] = phase.milestones.map(
            (_, mIndex) => ({
              x: -300 + index * 200,
              y: 200 + mIndex * 50,
            })
          );
        });
        break;

      case "radial":
        // Radial layout calculation
        const angleStep = (2 * Math.PI) / data.phases.length;
        data.phases.forEach((phase, index) => {
          const angle = index * angleStep;
          positions.phases.push({
            x: Math.cos(angle) * 200,
            y: Math.sin(angle) * 200,
          });
          positions.milestones[`phase-${index}`] = phase.milestones.map(
            (_, mIndex) => ({
              x: Math.cos(angle) * (200 + (mIndex + 1) * 50),
              y: Math.sin(angle) * (200 + (mIndex + 1) * 50),
            })
          );
        });
        break;

      // Add more layout calculations as needed
    }

    return positions;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-6 w-6 text-indigo-500" />
            Roadmap Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic or Goal</Label>
              <div className="flex gap-2">
                <Input
                  id="topic"
                  placeholder="Enter your topic or goal..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <Button onClick={generateRoadmap} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Roadmap"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {roadmapData && (
        <Card>
          <CardHeader>
            <CardTitle>Roadmap Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                  <Label>Layout</Label>
                  <Select
                    value={visualizationOptions.layout}
                    onValueChange={(value: any) =>
                      setVisualizationOptions((prev) => ({
                        ...prev,
                        layout: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hierarchical">Hierarchical</SelectItem>
                      <SelectItem value="force">Force</SelectItem>
                      <SelectItem value="radial">Radial</SelectItem>
                      <SelectItem value="dagre">Dagre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={visualizationOptions.theme}
                    onValueChange={(value: any) =>
                      setVisualizationOptions((prev) => ({
                        ...prev,
                        theme: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="colorful">Colorful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-labels"
                    checked={visualizationOptions.showLabels}
                    onCheckedChange={(checked) =>
                      setVisualizationOptions((prev) => ({
                        ...prev,
                        showLabels: checked,
                      }))
                    }
                  />
                  <Label htmlFor="show-labels">Show Labels</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-minimap"
                    checked={visualizationOptions.showMiniMap}
                    onCheckedChange={(checked) =>
                      setVisualizationOptions((prev) => ({
                        ...prev,
                        showMiniMap: checked,
                      }))
                    }
                  />
                  <Label htmlFor="show-minimap">Show MiniMap</Label>
                </div>
              </div>

              <div className="h-[600px] border rounded-lg">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                >
                  <Background />
                  {visualizationOptions.showControls && <Controls />}
                  {visualizationOptions.showMiniMap && <MiniMap />}
                </ReactFlow>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {roadmapData && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Main Goal</h3>
              <p className="text-gray-600">{roadmapData.mainGoal}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Phases</h3>
              <div className="space-y-4">
                {roadmapData.phases.map((phase, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-indigo-500 pl-4"
                  >
                    <h4 className="font-medium">
                      {phase.name} ({phase.duration})
                    </h4>
                    <div className="mt-2">
                      <h5 className="text-sm font-medium text-gray-500">
                        Milestones:
                      </h5>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        {phase.milestones.map((milestone, mIndex) => (
                          <li key={mIndex} className="text-gray-600">
                            {milestone}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-2">
                      <h5 className="text-sm font-medium text-gray-500">
                        Resources:
                      </h5>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        {phase.resources.map((resource, rIndex) => (
                          <li key={rIndex} className="text-gray-600">
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Success Metrics</h3>
              <ul className="list-disc list-inside space-y-1">
                {roadmapData.metrics.map((metric, index) => (
                  <li key={index} className="text-gray-600">
                    {metric}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Risk Analysis</h3>
              <div className="space-y-4">
                {roadmapData.risks.map((risk, index) => (
                  <div key={index} className="border-l-2 border-red-500 pl-4">
                    <p className="text-gray-600">{risk.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Mitigation: {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
