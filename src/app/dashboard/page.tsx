"use client";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";

import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/");

  return (
    <h1 className="text-xl">Welcome to your Dashboard,{session.user?.name}</h1>
  );
}
