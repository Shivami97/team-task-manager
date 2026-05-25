import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";
import { projectSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch projects where the user is an owner OR a member
    const projects = await db.project.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET Projects error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, description } = parsed.data;

    // Use a transaction to create the project and add the creator as an ADMIN member
    const project = await db.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          name,
          description,
          ownerId: user.id,
        }
      });

      await tx.projectMember.create({
        data: {
          projectId: newProject.id,
          userId: user.id,
          role: "ADMIN"
        }
      });

      return newProject;
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("POST Project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
