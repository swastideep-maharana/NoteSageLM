import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { Notebook } from "@/models/Notebook";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const notebook = await prisma.notebook.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!notebook) {
      return new NextResponse("Notebook not found", { status: 404 });
    }

    return NextResponse.json(notebook);
  } catch (error) {
    console.error("Error fetching notebook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, content, type, urls } = body;

    const notebook = await prisma.notebook.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        title,
        description,
        content,
        type,
        urls,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(notebook);
  } catch (error) {
    console.error("Error updating notebook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.notebook.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting notebook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
