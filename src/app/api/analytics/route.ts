import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get total notebooks
    const totalNotebooks = await prisma.notebook.count();

    // Get notebooks by category
    const notebooksByCategory = await prisma.notebook.groupBy({
      by: ["category"],
      _count: true,
    });

    // Get recent notebook activity
    const recentActivity = await prisma.notebook.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      take: 30,
      select: {
        updatedAt: true,
      },
    });

    // Get total words across all notebooks
    const totalWords = await prisma.note.aggregate({
      _sum: {
        wordCount: true,
      },
    });

    // Get content by type
    const contentByType = await prisma.note.groupBy({
      by: ["type"],
      _count: true,
    });

    // Get content growth over time
    const contentGrowth = await prisma.note.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        createdAt: true,
        wordCount: true,
      },
    });

    // Get AI interactions
    const totalInteractions = await prisma.aiInteraction.count();

    // Get AI feature usage
    const aiFeatureUsage = await prisma.aiInteraction.groupBy({
      by: ["feature"],
      _count: true,
    });

    // Get AI usage over time
    const aiUsage = await prisma.aiInteraction.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        createdAt: true,
      },
    });

    // Get total collaborators
    const totalCollaborators = await prisma.collaborator.count();

    // Get collaborators by role
    const collaboratorsByRole = await prisma.collaborator.groupBy({
      by: ["role"],
      _count: true,
    });

    // Get collaboration activity
    const collaborationActivity = await prisma.collaborationActivity.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        createdAt: true,
      },
    });

    // Format the data for the frontend
    const analyticsData = {
      notebooks: {
        total: totalNotebooks,
        byCategory: notebooksByCategory.map((category) => ({
          name: category.category || "Uncategorized",
          value: category._count,
        })),
        recentActivity: recentActivity.map((activity) => ({
          date: activity.updatedAt.toISOString().split("T")[0],
          count: 1,
        })),
      },
      content: {
        totalWords: totalWords._sum.wordCount || 0,
        byType: contentByType.map((type) => ({
          name: type.type,
          value: type._count,
        })),
        growth: contentGrowth.map((growth) => ({
          date: growth.createdAt.toISOString().split("T")[0],
          words: growth.wordCount,
        })),
      },
      ai: {
        totalInteractions,
        byFeature: aiFeatureUsage.map((feature) => ({
          name: feature.feature,
          value: feature._count,
        })),
        usage: aiUsage.map((usage) => ({
          date: usage.createdAt.toISOString().split("T")[0],
          count: 1,
        })),
      },
      collaboration: {
        totalCollaborators,
        byRole: collaboratorsByRole.map((role) => ({
          name: role.role,
          value: role._count,
        })),
        activity: collaborationActivity.map((activity) => ({
          date: activity.createdAt.toISOString().split("T")[0],
          actions: 1,
        })),
      },
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
