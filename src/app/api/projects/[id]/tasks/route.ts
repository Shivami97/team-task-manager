import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";
import { taskSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;

    // Verify current user is an ADMIN of the project
    const currentMember = await db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id
        }
      }
    });

    if (!currentMember || currentMember.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Only project Admins can create tasks." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description, status, priority, dueDate, assigneeId } = parsed.data;

    // Check if assignee is a member of the project (if assigned)
    if (assigneeId) {
      const assigneeMember = await db.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: assigneeId
          }
        }
      });

      if (!assigneeMember) {
        return NextResponse.json(
          { error: "Assignee must be a member of this project" },
          { status: 400 }
        );
      }
    }

    // Create the task
    const task = await db.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: new Date(dueDate),
        projectId,
        creatorId: user.id,
        assigneeId: assigneeId || null
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("POST Create Task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
