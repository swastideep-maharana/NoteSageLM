"use client";

import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, Calendar, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Task {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies: string[];
  status: "not-started" | "in-progress" | "completed";
}

interface GanttChartProps {
  notebookId: string;
}

export default function GanttChart({ notebookId }: GanttChartProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  useEffect(() => {
    fetchTasks();
  }, [notebookId]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/tasks`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const addNewTask = async () => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Task",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 0,
          dependencies: [],
          status: "not-started",
        }),
      });

      if (!response.ok) throw new Error("Failed to create task");

      const newTask = await response.json();
      setTasks((prevTasks) => [...prevTasks, newTask]);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const calculateTaskPosition = (task: Task) => {
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    const totalDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const taskStart =
      (start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const taskDuration =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    return {
      left: `${(taskStart / totalDays) * 100}%`,
      width: `${(taskDuration / totalDays) * 100}%`,
    };
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "not-started":
        return "bg-gray-200";
      case "in-progress":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  if (loading) {
    return <div>Loading Gantt chart...</div>;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Select
            value={viewMode}
            onValueChange={(value: any) => setViewMode(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="View mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Label>Start:</Label>
            <Input
              type="date"
              value={startDate.toISOString().split("T")[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label>End:</Label>
            <Input
              type="date"
              value={endDate.toISOString().split("T")[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
            />
          </div>
        </div>
        <Button onClick={addNewTask}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="relative">
          {/* Timeline header */}
          <div className="sticky top-0 bg-white border-b z-10">
            <div className="flex">
              <div className="w-48 p-2 border-r">Task</div>
              <div className="flex-1 relative">
                {/* Timeline markers */}
                <div className="flex">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 p-2 text-center text-sm text-gray-500 border-r"
                    >
                      {new Date(
                        startDate.getTime() + i * 24 * 60 * 60 * 1000
                      ).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="mt-4">
            {tasks.map((task) => {
              const position = calculateTaskPosition(task);
              return (
                <div key={task.id} className="flex items-center h-12 mb-2">
                  <div className="w-48 p-2 border-r">{task.title}</div>
                  <div className="flex-1 relative h-full">
                    <div
                      className={`absolute h-8 rounded ${getStatusColor(
                        task.status
                      )}`}
                      style={{
                        left: position.left,
                        width: position.width,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <div className="flex items-center justify-between px-2 h-full">
                        <span className="text-white text-sm">{task.title}</span>
                        <span className="text-white text-sm">
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
