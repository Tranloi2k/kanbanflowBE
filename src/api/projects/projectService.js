const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const notificationService = require("../notifications/notificationService");

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

    // Add lead as project member with admin role
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: leadId,
        role: "admin",
      },
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

  // Member management and invitation methods
  async getProjectMemberUserIds(projectId) {
    // Get user IDs of current project members for filtering
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      select: { userId: true },
    });

    return members.map(member => member.userId).filter(Boolean);
  }

  async inviteUserToProject(projectId, inviterUserId, inviteData) {
    const { email, role = "member", message } = inviteData;

    // Check if project exists and user has admin rights
    const project = await this.getProjectById(projectId);
    const inviterMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: inviterUserId,
        role: { in: ["admin", "lead"] },
      },
    });

    if (!inviterMember) {
      throw new ApiError(403, "You don't have permission to invite users to this project");
    }

    // Check if user exists
    const inviteeUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, fullName: true, email: true },
    });

    if (!inviteeUser) {
      throw new ApiError(404, "User not found");
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: inviteeUser.id,
      },
    });

    if (existingMember) {
      throw new ApiError(400, "User is already a member of this project");
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.projectInvitation.findFirst({
      where: {
        projectId,
        email,
        status: "PENDING",
      },
    });

    if (existingInvitation) {
      throw new ApiError(400, "There's already a pending invitation for this user");
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.projectInvitation.create({
      data: {
        projectId,
        inviterId: inviterUserId,
        inviteeId: inviteeUser.id,
        email,
        role,
        message,
        expiresAt,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        inviter: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        invitee: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        projectId,
        userId: inviterUserId,
        action: "INVITE_USER",
        details: {
          inviteeEmail: email,
          inviteeName: inviteeUser.fullName,
          role,
        },
      },
    });

    // Create notification for invitee
    try {
      await notificationService.createProjectInvitationNotification(
        inviteeUser.id,
        project.name,
        invitation.inviter.fullName,
        invitation.id
      );
    } catch (error) {
      console.error("Failed to create invitation notification:", error);
      // Don't fail the invitation if notification fails
    }

    return invitation;
  }

  async getProjectInvitations(projectId, inviterUserId) {
    // Check if user has admin rights
    const inviterMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: inviterUserId,
        role: { in: ["admin", "lead"] },
      },
    });

    if (!inviterMember) {
      throw new ApiError(403, "You don't have permission to view project invitations");
    }

    const invitations = await prisma.projectInvitation.findMany({
      where: { projectId },
      include: {
        inviter: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        invitee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        invitedAt: "desc",
      },
    });

    return invitations;
  }

  async getUserInvitations(userId) {
    const invitations = await prisma.projectInvitation.findMany({
      where: {
        inviteeId: userId,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            description: true,
            avatarColor: true,
          },
        },
        inviter: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        invitedAt: "desc",
      },
    });

    return invitations;
  }

  async respondToInvitation(invitationId, userId, response) {
    const { action } = response; // "accept" or "reject"

    const invitation = await prisma.projectInvitation.findUnique({
      where: { id: invitationId },
      include: {
        project: true,
      },
    });

    if (!invitation) {
      throw new ApiError(404, "Invitation not found");
    }

    if (invitation.inviteeId !== userId) {
      throw new ApiError(403, "You can only respond to your own invitations");
    }

    if (invitation.status !== "PENDING") {
      throw new ApiError(400, "This invitation has already been responded to");
    }

    if (invitation.expiresAt < new Date()) {
      throw new ApiError(400, "This invitation has expired");
    }

    const status = action === "accept" ? "ACCEPTED" : "REJECTED";

    // Update invitation status
    const updatedInvitation = await prisma.projectInvitation.update({
      where: { id: invitationId },
      data: {
        status,
        respondedAt: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        inviter: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // If accepted, add user as project member
    if (action === "accept") {
      await prisma.projectMember.create({
        data: {
          projectId: invitation.projectId,
          userId: userId,
          role: invitation.role,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          projectId: invitation.projectId,
          userId: userId,
          action: "ACCEPT_INVITATION",
          details: {
            projectName: invitation.project.name,
            role: invitation.role,
          },
        },
      });

      // Create notification for user being added to project
      try {
        await notificationService.createProjectMemberAddedNotification(
          userId,
          invitation.project.name,
          invitation.inviter.fullName,
          invitation.projectId
        );
      } catch (error) {
        console.error("Failed to create member added notification:", error);
      }
    } else {
      // Log rejection
      await prisma.activity.create({
        data: {
          projectId: invitation.projectId,
          userId: userId,
          action: "REJECT_INVITATION",
          details: {
            projectName: invitation.project.name,
          },
        },
      });
    }

    return updatedInvitation;
  }

  async cancelInvitation(invitationId, userId) {
    const invitation = await prisma.projectInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new ApiError(404, "Invitation not found");
    }

    // Check if user has admin rights in the project
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId: invitation.projectId,
        userId: userId,
        role: { in: ["admin", "lead"] },
      },
    });

    if (!member) {
      throw new ApiError(403, "You don't have permission to cancel this invitation");
    }

    if (invitation.status !== "PENDING") {
      throw new ApiError(400, "Only pending invitations can be cancelled");
    }

    await prisma.projectInvitation.update({
      where: { id: invitationId },
      data: {
        status: "CANCELLED",
        respondedAt: new Date(),
      },
    });

    return true;
  }

  async updateMemberRole(projectId, memberId, newRole, updaterUserId) {
    // Check if updater has admin rights
    const updaterMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: updaterUserId,
        role: { in: ["admin", "lead"] },
      },
    });

    if (!updaterMember) {
      throw new ApiError(403, "You don't have permission to update member roles");
    }

    // Get the member to update
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!member || member.projectId !== projectId) {
      throw new ApiError(404, "Project member not found");
    }

    // Prevent removing the last admin
    if (member.role === "admin" && newRole !== "admin") {
      const adminCount = await prisma.projectMember.count({
        where: {
          projectId,
          role: "admin",
        },
      });

      if (adminCount <= 1) {
        throw new ApiError(400, "Cannot remove the last admin from the project");
      }
    }

    const updatedMember = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role: newRole },
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
        userId: updaterUserId,
        action: "UPDATE_MEMBER_ROLE",
        details: {
          memberName: member.user.fullName,
          oldRole: member.role,
          newRole,
        },
      },
    });

    // Create notification for role update
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { name: true },
      });
      
      const updater = await prisma.user.findUnique({
        where: { id: updaterUserId },
        select: { fullName: true },
      });

      await notificationService.createRoleUpdatedNotification(
        member.user.id,
        project.name,
        newRole,
        updater.fullName,
        projectId
      );
    } catch (error) {
      console.error("Failed to create role update notification:", error);
    }

    return updatedMember;
  }
}

module.exports = new ProjectService();
