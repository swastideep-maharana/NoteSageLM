import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { Notebook } from "@/models/Notebook";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Optional: Add search by tag query param ?tag=someTag
  const url = new URL(req.url);
  const tagFilter = url.searchParams.get("tag");

  let filter = { userId: session.user?.email } as any;
  if (tagFilter) {
    filter.tags = tagFilter;
  }

  const notebooks = await Notebook.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(notebooks);
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title } = await req.json();

  if (!title)
    return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const notebook = await Notebook.create({
    title,
    userId: session.user?.email,
  });

  return NextResponse.json(notebook, { status: 201 });
}
