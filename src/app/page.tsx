"use client";

import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-6 text-center">
      <h1 className="text-4xl font-bold">NotebookLM AI</h1>
      <p className="text-lg text-muted-foreground">Your smart research notebook powered by AI.</p>
      {session ? (
        <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
      ) : (
        <Button onClick={() => signIn("google")}>Sign in with Google</Button>
      )}
    </main>
  );
}
