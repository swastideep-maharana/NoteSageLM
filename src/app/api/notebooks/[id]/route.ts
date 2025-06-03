import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { Notebook } from "@/models/Notebook";

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context; // await context.params if needed
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
