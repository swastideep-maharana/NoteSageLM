"use client";

import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Calendar, Clock, ChevronRight } from "lucide-react";

interface TimelineEvent {
  id: string;
  title: string;
  content: string;
  date: string;
  type: "note" | "edit" | "share" | "tag";
}

interface TimelineViewProps {
  notebookId: string;
}

export default function TimelineView({ notebookId }: TimelineViewProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimelineEvents();
  }, [notebookId]);

  const fetchTimelineEvents = async () => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/timeline`);
      if (!response.ok) throw new Error("Failed to fetch timeline events");
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error("Error fetching timeline events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "note":
        return <Calendar className="h-4 w-4" />;
      case "edit":
        return <Clock className="h-4 w-4" />;
      case "share":
        return <ChevronRight className="h-4 w-4" />;
      case "tag":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "note":
        return "bg-blue-500";
      case "edit":
        return "bg-green-500";
      case "share":
        return "bg-purple-500";
      case "tag":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return <div>Loading timeline...</div>;
  }

  return (
    <Card className="p-4">
      <ScrollArea className="h-[600px]">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Timeline events */}
          <div className="space-y-8">
            {events.map((event) => (
              <div key={event.id} className="relative pl-12">
                {/* Event dot */}
                <div
                  className={`absolute left-0 w-8 h-8 rounded-full ${getEventColor(
                    event.type
                  )} flex items-center justify-center text-white`}
                >
                  {getEventIcon(event.type)}
                </div>

                {/* Event content */}
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{event.title}</h3>
                    <span className="text-sm text-gray-500">{event.date}</span>
                  </div>
                  <p className="text-gray-600">{event.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
