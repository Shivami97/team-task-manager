import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();

    // Fetch all tasks where the user is the assignee
    const myTasks = await db.task.findMany({
      where: { assigneeId: user.id },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    });

    // Compute metrics
    const total = myTasks.length;
    const completed = myTasks.filter((t) => t.status === "COMPLETED").length;
    const inProgress = myTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const inReview = myTasks.filter((t) => t.status === "IN_REVIEW").length;
    const todo = myTasks.filter((t) => t.status === "TODO").length;
    
    const pending = total - completed;

    const overdue = myTasks.filter(
      (t) => t.status !== "COMPLETED" && new Date(t.dueDate) < now
    ).length;

    // Fetch upcoming/urgent tasks (not completed, sorted by due date)
    const upcomingTasks = await db.task.findMany({
      where: {
        assigneeId: user.id,
        status: { not: "COMPLETED" }
      },
      include: {
        project: { select: { id: true, name: true } }
      },
      orderBy: { dueDate: "asc" },
      take: 5
    });

    // Fetch projects where the user is an owner or member
    const projects = await db.project.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      },
      include: {
        _count: {
          select: { tasks: true, members: true }
        }
      },
      orderBy: { updatedAt: "desc" },
      take: 3
    });

    return NextResponse.json({
      stats: {
        total,
        completed,
        pending,
        todo,
        inProgress,
        inReview,
        overdue
      },
      upcomingTasks,
      recentProjects: projects
    });
  } catch (error) {
    console.error("GET Dashboard Stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
