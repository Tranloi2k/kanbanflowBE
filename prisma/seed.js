const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("password123", 10);

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: "admin@kanbanflow.com" },
      update: {},
      create: {
        email: "admin@kanbanflow.com",
        passwordHash: adminPassword,
        fullName: "System Administrator",
        role: "admin",
        isActive: true,
      },
    });

    // Create demo project lead
    const projectLead = await prisma.user.upsert({
      where: { email: "lead@kanbanflow.com" },
      update: {},
      create: {
        email: "lead@kanbanflow.com",
        passwordHash: userPassword,
        fullName: "Project Lead",
        role: "user",
        isActive: true,
      },
    });

    // Create demo project
    const demoProject = await prisma.project.upsert({
      where: { key: "DEMO" },
      update: {},
      create: {
        name: "Demo Project",
        key: "DEMO",
        description: "A demo project for testing KanbanFlow features",
        category: "software-development",
        template: "kanban",
        leadId: projectLead.id,
        avatarColor: "bg-blue-500",
        isStarred: false,
        isArchived: false,
      },
    });

    // Add project lead as a member
    await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: demoProject.id,
          userId: projectLead.id,
        },
      },
      update: {},
      create: {
        projectId: demoProject.id,
        userId: projectLead.id,
        role: "lead",
      },
    });

    // Create sample issues with different statuses
    await prisma.issue.create({
      data: {
        projectId: demoProject.id,
        title: "Setup project documentation",
        description:
          "Create comprehensive documentation for the project setup and API usage",
        issueType: "task",
        priority: "medium",
        status: "TODO",
        reporterId: projectLead.id,
        position: 1,
      },
    });

    await prisma.issue.create({
      data: {
        projectId: demoProject.id,
        title: "Implement user authentication",
        description: "Add JWT authentication system with login/logout functionality",
        issueType: "feature",
        priority: "high",
        status: "INPROGRESS",
        reporterId: projectLead.id,
        assigneeId: projectLead.id,
        position: 2,
      },
    });

    await prisma.issue.create({
      data: {
        projectId: demoProject.id,
        title: "Code review for dashboard component",
        description: "Review the dashboard component implementation",
        issueType: "task",
        priority: "medium",
        status: "REVIEW",
        reporterId: projectLead.id,
        position: 3,
      },
    });

    console.log("✅ Database seeded successfully!");
    console.log(`📧 Admin: admin@kanbanflow.com / admin123`);
    console.log(`📧 Project Lead: lead@kanbanflow.com / password123`);
    console.log(`📁 Demo Project: ${demoProject.name} (${demoProject.key})`);
    console.log(`📋 Sample Issues created with different statuses`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
