import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { Notebook } from "@/models/Notebook";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch notebooks for the logged-in user
  const notebooks = await Notebook.find({ userId: session.user?.email }).lean();

  return NextResponse.json(notebooks, { status: 200 });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, notes, summary } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  let notesToSave = notes || [];

  if (summary && !notes) {
    notesToSave = [
      {
        content: summary,
        createdAt: new Date(),
      },
    ];
  }

  const notebook = await Notebook.create({
    title,
    userId: session.user?.email,
    notes: notesToSave,
  });

  return NextResponse.json(notebook, { status: 201 });
}
