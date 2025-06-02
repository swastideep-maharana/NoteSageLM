"use client";

import { Button } from "./ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex gap-2 items-center">
        <p className="text-sm">Hi, {session.user?.name}</p>
        <Button variant="outline" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>
    );
  }

  return <Button onClick={() => signIn(`google`)}>Sign in with Google</Button>;
}
