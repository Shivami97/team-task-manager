const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creating users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Alex Mercer",
      email: "admin@aether.com",
      passwordHash,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: "Sarah Connor",
      email: "member1@aether.com",
      passwordHash,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: "David Lightman",
      email: "member2@aether.com",
      passwordHash,
    },
  });

  console.log("Creating projects...");
  const project = await prisma.project.create({
    data: {
      name: "Alpha Platform Launch",
      description: "Next-gen orchestration dashboard launch detailing marketing, database migrations, and front-end polishing tasks.",
      ownerId: admin.id,
    },
  });

  console.log("Adding project memberships...");
  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: admin.id, role: "ADMIN" },
      { projectId: project.id, userId: member1.id, role: "MEMBER" },
      { projectId: project.id, userId: member2.id, role: "MEMBER" },
    ],
  });

  console.log("Creating tasks...");
  const today = new Date();
  
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 2);

  await prisma.task.createMany({
    data: [
      {
        title: "Setup Prisma Database & Auth REST APIs",
        description: "Configure models for Users, Projects, Members, and Tasks. Secure routes with Edge-compatible cookie middleware.",
        status: "COMPLETED",
        priority: "HIGH",
        dueDate: yesterday,
        projectId: project.id,
        creatorId: admin.id,
        assigneeId: admin.id,
      },
      {
        title: "Design Brand Mockups & Guidelines",
        description: "Design premium glassmorphism layouts, color schemes, high-fidelity landing visuals, and typography parameters.",
        status: "TODO",
        priority: "HIGH",
        dueDate: nextWeek,
        projectId: project.id,
        creatorId: admin.id,
        assigneeId: member1.id,
      },
      {
        title: "Develop Interactive Kanban Board UI",
        description: "Implement responsive grid columns, responsive status changes, edit modifiers, and quick assignee filters.",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        dueDate: tomorrow,
        projectId: project.id,
        creatorId: admin.id,
        assigneeId: member1.id,
      },
      {
        title: "Write Integration Tests for API Endpoints",
        description: "Verify granular role restrictions (members cannot add members, modify project features, or create tasks).",
        status: "IN_REVIEW",
        priority: "LOW",
        dueDate: nextWeek,
        projectId: project.id,
        creatorId: admin.id,
        assigneeId: member2.id,
      },
      {
        title: "Perform Security Vulnerability Audit",
        description: "Check dependency issues, secure HTTP-only cookies, prevent XSS threats, and check password hash bounds.",
        status: "TODO",
        priority: "HIGH",
        dueDate: yesterday, // Overdue task!
        projectId: project.id,
        creatorId: admin.id,
        assigneeId: member2.id,
      },
    ],
  });

  console.log("Database seeded successfully!");
  console.log("\n--- Demo Login Credentials ---");
  console.log("Admin User:  admin@aether.com  / password123");
  console.log("Member 1:    member1@aether.com / password123");
  console.log("Member 2:    member2@aether.com / password123");
  console.log("------------------------------\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
