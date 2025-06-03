import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { Notebook } from "@/models/Notebook";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, tags } = await req.json();

  if (
    tags &&
    (!Array.isArray(tags) || !tags.every((t) => typeof t === "string"))
  ) {
    return NextResponse.json(
      { error: "Tags must be an array of strings" },
      { status: 400 }
    );
  }

  const updateData: any = { content };
  if (tags) updateData.tags = tags;

  const notebook = await Notebook.findOneAndUpdate(
    { _id: params.id, userId: session.user?.email },
    updateData,
    { new: true }
  );

  if (!notebook) {
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );
  }

  return NextResponse.json(notebook);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notebook = await Notebook.findOneAndDelete({
    _id: params.id,
    userId: session.user?.email,
  });

  if (!notebook) {
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Notebook deleted" });
}
