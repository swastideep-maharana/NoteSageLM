import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "all"; // all, notebooks, content, tags

    if (!query) {
      return NextResponse.json(
        { error: "Missing search query" },
        { status: 400 }
      );
    }

    let results = [];

    switch (type) {
      case "notebooks":
        results = await prisma.notebook.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
            ],
          },
          include: {
            tags: true,
          },
        });
        break;

      case "content":
        results = await prisma.notebook.findMany({
          where: {
            content: { contains: query, mode: "insensitive" },
          },
          select: {
            id: true,
            title: true,
            content: true,
            tags: true,
          },
        });
        break;

      case "tags":
        results = await prisma.tag.findMany({
          where: {
            name: { contains: query, mode: "insensitive" },
          },
          include: {
            notebooks: true,
          },
        });
        break;

      default:
        // Search across all types
        const [notebooks, tags] = await Promise.all([
          prisma.notebook.findMany({
            where: {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
              ],
            },
            include: {
              tags: true,
            },
          }),
          prisma.tag.findMany({
            where: {
              name: { contains: query, mode: "insensitive" },
            },
            include: {
              notebooks: true,
            },
          }),
        ]);

        results = {
          notebooks,
          tags,
        };
    }

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: err.message || "Search failed" },
      { status: 500 }
    );
  }
}
