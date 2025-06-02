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

  const notebooks = await Notebook.find({ userId: session.user?.email }).sort({
    createdAt: -1,
  });
  return NextResponse.json(notebooks);
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title } = await req.json();

  if (!title)
    return NextResponse.json({ error: "Tile is required" }, { status: 400 });

  const notebook = await Notebook.create({
    title,
    userId: session.user?.email,
  });

  return NextResponse.json(notebook, { status: 201 });
}
