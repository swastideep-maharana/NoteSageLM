import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { Note } from "@/models/Note";

// Handle GET: fetch notes for the logged-in user, optionally filtered by notebookId
export async function GET(req: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const notebookId = url.searchParams.get("notebookId");

  let query: any = { userId: session.user?.email };
  if (notebookId) {
    query.notebookId = notebookId;
  }

  try {
    const notes = await Note.find(query).sort({ updatedAt: -1 });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// Handle POST: create a new note
export async function POST(req: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { notebookId, title, content } = await req.json();

    if (!notebookId || !title) {
      return NextResponse.json(
        { error: "Notebook ID and title are required" },
        { status: 400 }
      );
    }

    const note = await Note.create({
      userId: session.user?.email,
      notebookId,
      title,
      content: content || "",
    });

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
