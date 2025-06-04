"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserNav } from "@/components/UserNav";

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center px-6 gap-6">
        <div className="flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notebooks..."
              className="pl-10 h-10 bg-background/50 border-border/50 focus:border-border rounded-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" className="rounded-full gap-2">
            <Plus className="h-4 w-4" />
            New Notebook
          </Button>
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
