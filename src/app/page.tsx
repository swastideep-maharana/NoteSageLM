'use client'
import { AuthButtons } from "@/components/AuthButtons";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex items-center justify-center h-screen">
        <AuthButtons/>
    </main>
  );
}
