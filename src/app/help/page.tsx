"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Search,
  HelpCircle,
  Video,
  Map,
  Users,
  Settings,
  MessageSquare,
} from "lucide-react";

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: {
    title: string;
    description: string;
    steps?: string[];
    tips?: string[];
  }[];
}

const helpSections: HelpSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <BookOpen className="h-5 w-5" />,
    content: [
      {
        title: "Welcome to NotebookLM",
        description:
          "NotebookLM is an AI-powered note-taking and knowledge management platform. This guide will help you get started with the basic features.",
        steps: [
          "Create your first notebook",
          "Add notes and content",
          "Use AI features to enhance your notes",
          "Organize with tags and folders",
        ],
      },
      {
        title: "Basic Navigation",
        description:
          "Learn how to navigate through the application and access different features.",
        steps: [
          "Use the sidebar to switch between notebooks",
          "Access AI features from the toolbar",
          "Use the search bar to find content",
          "Access settings from the user menu",
        ],
      },
    ],
  },
  {
    id: "ai-features",
    title: "AI Features",
    icon: <HelpCircle className="h-5 w-5" />,
    content: [
      {
        title: "Content Analysis",
        description:
          "Use AI to analyze your content and get insights about themes, sentiment, and key points.",
        steps: [
          "Select the text you want to analyze",
          "Click the AI button in the toolbar",
          "Choose the analysis type",
          "Review and apply the suggestions",
        ],
      },
      {
        title: "Smart Summarization",
        description: "Generate concise summaries of your notes and content.",
        steps: [
          "Select the content to summarize",
          "Choose the summary type (concise, detailed, or bullet points)",
          "Review and edit the generated summary",
          "Save or export the summary",
        ],
      },
    ],
  },
  {
    id: "youtube-summarizer",
    title: "YouTube Summarizer",
    icon: <Video className="h-5 w-5" />,
    content: [
      {
        title: "Summarize YouTube Videos",
        description:
          "Extract key information from YouTube videos and create structured summaries.",
        steps: [
          "Paste the YouTube video URL",
          "Click the Summarize button",
          "Review the generated summary",
          "Export or save the summary",
        ],
        tips: [
          "Works best with videos that have captions",
          "You can export summaries in different formats",
          "Use the chapter markers to navigate the video",
        ],
      },
    ],
  },
  {
    id: "roadmap",
    title: "Roadmap Generator",
    icon: <Map className="h-5 w-5" />,
    content: [
      {
        title: "Create Project Roadmaps",
        description: "Generate detailed roadmaps for your projects and goals.",
        steps: [
          "Enter your project topic or goal",
          "Choose the roadmap type",
          "Customize the visualization",
          "Export or share the roadmap",
        ],
        tips: [
          "Use different layouts for different project types",
          "Add dependencies between tasks",
          "Track progress with milestones",
        ],
      },
    ],
  },
  {
    id: "collaboration",
    title: "Collaboration",
    icon: <Users className="h-5 w-5" />,
    content: [
      {
        title: "Real-time Collaboration",
        description:
          "Work together with your team in real-time on notebooks and projects.",
        steps: [
          "Share your notebook with team members",
          "Set permission levels",
          "Use the collaboration panel",
          "Track changes and comments",
        ],
        tips: [
          "Use comments to provide feedback",
          "Track changes in the activity log",
          "Set up notifications for updates",
        ],
      },
    ],
  },
  {
    id: "settings",
    title: "Settings & Customization",
    icon: <Settings className="h-5 w-5" />,
    content: [
      {
        title: "Customize Your Experience",
        description:
          "Personalize your workspace and adjust settings to match your preferences.",
        steps: [
          "Access settings from the user menu",
          "Choose your preferred theme",
          "Configure notification preferences",
          "Set up keyboard shortcuts",
        ],
      },
    ],
  },
  {
    id: "support",
    title: "Support & Feedback",
    icon: <MessageSquare className="h-5 w-5" />,
    content: [
      {
        title: "Get Help & Provide Feedback",
        description:
          "Access support resources and share your feedback to help improve NotebookLM.",
        steps: [
          "Check the documentation",
          "Submit a support ticket",
          "Join the community forum",
          "Share your feedback",
        ],
      },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("getting-started");

  const filteredSections = helpSections.filter((section) =>
    section.content.some(
      (content) =>
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Help Center</h1>
          <p className="text-gray-600">
            Find answers to your questions and learn how to use NotebookLM
            effectively.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="w-64">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {helpSections.map((section) => (
                      <Button
                        key={section.id}
                        variant={
                          activeTab === section.id ? "secondary" : "ghost"
                        }
                        className="w-full justify-start"
                        onClick={() => setActiveTab(section.id)}
                      >
                        {section.icon}
                        <span className="ml-2">{section.title}</span>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search help articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-8">
                    {filteredSections.map((section) => (
                      <div key={section.id} className="space-y-6">
                        <div className="flex items-center gap-2">
                          {section.icon}
                          <h2 className="text-2xl font-semibold">
                            {section.title}
                          </h2>
                        </div>
                        {section.content.map((content, index) => (
                          <div key={index} className="space-y-4">
                            <div>
                              <h3 className="text-xl font-medium mb-2">
                                {content.title}
                              </h3>
                              <p className="text-gray-600">
                                {content.description}
                              </p>
                            </div>
                            {content.steps && (
                              <div>
                                <h4 className="font-medium mb-2">Steps:</h4>
                                <ol className="list-decimal list-inside space-y-2">
                                  {content.steps.map((step, stepIndex) => (
                                    <li
                                      key={stepIndex}
                                      className="text-gray-600"
                                    >
                                      {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                            {content.tips && (
                              <div>
                                <h4 className="font-medium mb-2">Tips:</h4>
                                <ul className="list-disc list-inside space-y-2">
                                  {content.tips.map((tip, tipIndex) => (
                                    <li
                                      key={tipIndex}
                                      className="text-gray-600"
                                    >
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
