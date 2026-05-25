import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";
import { memberInviteSchema } from "@/lib/validation";

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
        { error: "Access denied. Only Admins can manage team members." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = memberInviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, role } = parsed.data;

    // Find the user to add by email
    const targetUser = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User with this email address does not exist" },
        { status: 404 }
      );
    }

    // Check if the user is already a member
    const existingMember = await db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUser.id
        }
      }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this project" },
        { status: 400 }
      );
    }

    // Add user as a member
    const newMember = await db.projectMember.create({
      data: {
        projectId,
        userId: targetUser.id,
        role
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json({ member: newMember }, { status: 201 });
  } catch (error) {
    console.error("POST Project Member error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
