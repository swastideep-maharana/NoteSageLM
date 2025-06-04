import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { Notebook } from "@/models/Notebook";
import { Note } from "@/models/Note";

// Type definitions
interface NotebookInput {
  title: string;
  content?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface NoteInput {
  title: string;
  content?: string;
  notebookTitle: string;
  createdAt?: string;
  updatedAt?: string;
}

function isValidNotebook(nb: any): nb is NotebookInput {
  return (
    nb &&
    typeof nb === "object" &&
    typeof nb.title === "string" &&
    (nb.content === undefined || typeof nb.content === "string") &&
    (nb.tags === undefined ||
      (Array.isArray(nb.tags) &&
        nb.tags.every((t: unknown) => typeof t === "string"))) &&
    (nb.createdAt === undefined || typeof nb.createdAt === "string") &&
    (nb.updatedAt === undefined || typeof nb.updatedAt === "string")
  );
}

function isValidNote(note: any): note is NoteInput {
  return (
    note &&
    typeof note === "object" &&
    typeof note.title === "string" &&
    typeof note.notebookTitle === "string" &&
    (note.content === undefined || typeof note.content === "string") &&
    (note.createdAt === undefined || typeof note.createdAt === "string") &&
    (note.updatedAt === undefined || typeof note.updatedAt === "string")
  );
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("notebooks" in body) ||
    !("notes" in body)
  ) {
    return NextResponse.json(
      { error: "Missing notebooks or notes" },
      { status: 400 }
    );
  }

  const { notebooks, notes } = body as { notebooks: unknown; notes: unknown };

  if (!Array.isArray(notebooks) || !Array.isArray(notes)) {
    return NextResponse.json(
      { error: "Notebooks and notes must be arrays" },
      { status: 400 }
    );
  }

  if (!notebooks.every(isValidNotebook)) {
    return NextResponse.json(
      { error: "Invalid notebook format" },
      { status: 400 }
    );
  }

  if (!notes.every(isValidNote)) {
    return NextResponse.json({ error: "Invalid note format" }, { status: 400 });
  }

  const userId = session.user.email;

  try {
    const createdNotebooks = await Promise.all(
      notebooks.map(async (nb) => {
        const existing = await Notebook.findOne({ title: nb.title, userId });
        if (existing) return existing;

        return await Notebook.create({
          userId,
          title: nb.title,
          content: nb.content || "",
          tags: nb.tags || [],
          createdAt: nb.createdAt ? new Date(nb.createdAt) : undefined,
          updatedAt: nb.updatedAt ? new Date(nb.updatedAt) : undefined,
        });
      })
    );

    await Promise.all(
      notes.map(async (note) => {
        const notebook = createdNotebooks.find(
          (nb) => nb.title === note.notebookTitle
        );
        if (!notebook) return;

        const existingNote = await Note.findOne({
          title: note.title,
          notebookId: notebook._id,
          userId,
        });

        if (existingNote) return;

        await Note.create({
          notebookId: notebook._id,
          title: note.title,
          content: note.content || "",
          userId,
          createdAt: note.createdAt ? new Date(note.createdAt) : undefined,
          updatedAt: note.updatedAt ? new Date(note.updatedAt) : undefined,
        });
      })
    );

    return NextResponse.json({ message: "Import successful" });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
