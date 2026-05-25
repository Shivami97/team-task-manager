import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";
import { taskSchema } from "@/lib/validation";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { taskId } = await params;

    // Fetch the task and its project membership
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Verify current user is a member of the project
    const currentMember = await db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId: user.id
        }
      }
    });

    if (!currentMember) {
      return NextResponse.json(
        { error: "Access denied. You are not a member of this project" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Role-based validation
    if (currentMember.role === "MEMBER") {
      // Members can ONLY update status
      const { status } = body;
      
      if (!status || !["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"].includes(status)) {
        return NextResponse.json(
          { error: "Members are only permitted to update the task status" },
          { status: 400 }
        );
      }

      const updatedTask = await db.task.update({
        where: { id: taskId },
        data: { status },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true, email: true } }
        }
      });

      return NextResponse.json({ task: updatedTask });
    } else {
      // Admins can update everything
      const parsed = taskSchema.partial().safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0].message },
          { status: 400 }
        );
      }

      const updateData: any = {};
      const { title, description, status, priority, dueDate, assigneeId } = parsed.data;

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (priority !== undefined) updateData.priority = priority;
      if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
      
      if (assigneeId !== undefined) {
        if (assigneeId) {
          // Verify assignee is a member
          const assigneeMember = await db.projectMember.findUnique({
            where: {
              projectId_userId: {
                projectId: task.projectId,
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
          updateData.assigneeId = assigneeId;
        } else {
          updateData.assigneeId = null;
        }
      }

      const updatedTask = await db.task.update({
        where: { id: taskId },
        data: updateData,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true, email: true } }
        }
      });

      return NextResponse.json({ task: updatedTask });
    }
  } catch (error) {
    console.error("PATCH Task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { taskId } = await params;

    const task = await db.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Verify current user is an ADMIN of the project
    const currentMember = await db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId: user.id
        }
      }
    });

    if (!currentMember || currentMember.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Only project Admins can delete tasks." },
        { status: 403 }
      );
    }

    await db.task.delete({
      where: { id: taskId }
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DELETE Task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
