"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlusCircle,
  BookOpen,
  Star,
  Trash2,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const routes = [
  {
    label: "All Notebooks",
    icon: BookOpen,
    href: "/dashboard",
    color: "text-blue-500",
  },
  {
    label: "Starred",
    icon: Star,
    href: "/dashboard/starred",
    color: "text-yellow-500",
  },
  {
    label: "AI Assistant",
    icon: Sparkles,
    href: "/dashboard/ai",
    color: "text-purple-500",
  },
  {
    label: "Trash",
    icon: Trash2,
    href: "/dashboard/trash",
    color: "text-red-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-gray-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-72 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-semibold">NotebookLM</span>
        </Link>
      </div>
      <div className="p-6">
        <Button className="w-full justify-start gap-2 h-11" variant="outline">
          <PlusCircle className="h-5 w-5" />
          New Notebook
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === route.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <route.icon className={cn("h-5 w-5", route.color)} />
              {route.label}
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
