"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="w-full flex justify-between items-center p-4 border-b shadow-sm">
      <Link href="/" className="text-xl font-semibold">
        NotebookLM
      </Link>

      <div className="flex gap-4 items-center">
        <Link href="/dashboard">
          <Button variant="ghost">Dashboard</Button>
        </Link>

        {status === "authenticated" ? (
          <>
            <Link href="/dashboard/new">
              <Button variant="outline">New Notebook</Button>
            </Link>
            <Button onClick={() => signOut()} variant="destructive">
              Sign Out
            </Button>
          </>
        ) : (
          <Button onClick={() => signIn("google")}>Sign In</Button>
        )}
      </div>
    </nav>
  );
}
