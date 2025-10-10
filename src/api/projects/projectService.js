const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");

class ProjectService {
  async getAllProjects() {
    const projects = await prisma.project.findMany({
      include: {
        lead: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            issues: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return projects.map((project) => ({
      ...project,
      leadName: project.lead?.fullName,
      memberCount: project._count.members,
      issueCount: project._count.issues,
    }));
  }

  async getProjectById(id) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
        issueStatuses: {
          orderBy: {
            position: "asc",
          },
        },
        issueLabels: true,
        _count: {
          select: {
            issues: true,
            members: true,
          },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    return {
      ...project,
      leadName: project.lead?.fullName,
      memberCount: project._count.members,
      issueCount: project._count.issues,
    };
  }

  async createProject(projectData) {
    const { name, key, description, category, template, leadId, avatarColor } =
      projectData;

    // Check if project key already exists
    const existingProject = await prisma.project.findUnique({
      where: { key },
    });

    if (existingProject) {
      throw new ApiError(400, "Project key already exists");
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        key: key.toUpperCase(),
        description,
        category,
        template,
        leadId,
        avatarColor: avatarColor || "bg-blue-500",
      },
      include: {
        lead: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Add lead as project member
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: leadId,
        role: "lead",
      },
    });

    // Create default issue statuses
    await prisma.issueStatus.createMany({
      data: [
        {
          projectId: project.id,
          name: "To Do",
          position: 1,
          color: "bg-gray-500",
        },
        {
          projectId: project.id,
          name: "In Progress",
          position: 2,
          color: "bg-blue-500",
        },
        {
          projectId: project.id,
          name: "Review",
          position: 3,
          color: "bg-yellow-500",
        },
        {
          projectId: project.id,
          name: "Done",
          position: 4,
          color: "bg-green-500",
        },
      ],
    });

    // Create default labels
    await prisma.issueLabel.createMany({
      data: [
        {
          projectId: project.id,
          name: "Bug",
          color: "bg-red-500",
        },
        {
          projectId: project.id,
          name: "Feature",
          color: "bg-blue-500",
        },
        {
          projectId: project.id,
          name: "Enhancement",
          color: "bg-purple-500",
        },
        {
          projectId: project.id,
          name: "Documentation",
          color: "bg-gray-500",
        },
      ],
    });

    // Log activity
    await prisma.activity.create({
      data: {
        projectId: project.id,
        userId: leadId,
        action: "CREATE_PROJECT",
        details: {
          projectName: name,
          projectKey: key,
        },
      },
    });

    return project;
  }

  async updateProject(id, updateData) {
    // Check if project exists
    await this.getProjectById(id);

    const { name, description, category, avatarColor, isStarred, isArchived } =
      updateData;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(avatarColor && { avatarColor }),
        ...(isStarred !== undefined && { isStarred }),
        ...(isArchived !== undefined && { isArchived }),
      },
      include: {
        lead: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return updatedProject;
  }

  async deleteProject(id) {
    // Check if project exists
    await this.getProjectById(id);

    await prisma.project.delete({
      where: { id },
    });

    return true;
  }

  async getUserProjects(userId) {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { leadId: userId },
          {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        lead: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        members: {
          where: {
            userId: userId,
          },
          select: {
            role: true,
          },
        },
        _count: {
          select: {
            issues: true,
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return projects.map((project) => ({
      ...project,
      userRole:
        project.members[0]?.role ||
        (project.leadId === userId ? "lead" : "member"),
      leadName: project.lead?.fullName,
      memberCount: project._count.members,
      issueCount: project._count.issues,
    }));
  }

  async getProjectMembers(projectId) {
    // Check if project exists
    await this.getProjectById(projectId);

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    return members.map((member) => ({
      id: member.id,
      role: member.role,
      joinedAt: member.joinedAt,
      user: member.user,
    }));
  }

  async addProjectMember(projectId, memberData) {
    const { userId, role = "member" } = memberData;

    // Check if project exists
    await this.getProjectById(projectId);

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
    });

    if (existingMember) {
      throw new ApiError(400, "User is already a member of this project");
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        projectId,
        userId,
        action: "ADD_MEMBER",
        details: {
          memberName: member.user.fullName,
          role,
        },
      },
    });

    return member;
  }

  async removeProjectMember(projectId, userId) {
    // Check if project exists
    await this.getProjectById(projectId);

    const member = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!member) {
      throw new ApiError(404, "Project member not found");
    }

    await prisma.projectMember.delete({
      where: {
        id: member.id,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        projectId,
        userId,
        action: "REMOVE_MEMBER",
        details: {
          memberName: member.user.fullName,
        },
      },
    });

    return true;
  }
}

module.exports = new ProjectService();
