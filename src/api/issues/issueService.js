const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const notificationService = require("../notifications/notificationService");

class IssueService {
  async getAllIssues(filters = {}) {
    const {
      priority,
      issueType,
      status,
      assignee,
      limit = 20,
      offset = 0,
    } = filters;

    const where = {};
    if (priority) where.priority = priority;
    if (issueType) where.issueType = issueType;
    if (status) where.status = status;
    if (assignee) where.assigneeId = assignee;

    const issues = await prisma.issue.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        labelRelations: {
          include: {
            label: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    return issues.map((issue) => ({
      ...issue,
      labels: issue.labelRelations.map((rel) => rel.label),
      commentCount: issue._count.comments,
    }));
  }

  async getIssueById(id) {
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            leadId: true,
          },
        },
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        labelRelations: {
          include: {
            label: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!issue) {
      throw new ApiError(404, "Issue not found");
    }

    return {
      ...issue,
      labels: issue.labelRelations.map((rel) => rel.label),
    };
  }

  async createIssue(issueData) {
    const {
      projectId,
      title,
      description,
      issueType = "task",
      priority = "medium",
      status = "TODO",
      assigneeId,
      reporterId,
      storyPoints,
      dueDate,
      labelIds = [],
    } = issueData;

    // Get project to validate it exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // Get next position
    const lastIssue = await prisma.issue.findFirst({
      where: { projectId },
      orderBy: { position: "desc" },
    });
    const position = (lastIssue?.position || 0) + 1;

    // Create issue
    const issue = await prisma.issue.create({
      data: {
        projectId,
        title,
        description,
        issueType,
        priority,
        status,
        assigneeId,
        reporterId,
        storyPoints,
        position,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Add labels if provided
    if (labelIds.length > 0) {
      await prisma.issueLabelRelation.createMany({
        data: labelIds.map((labelId) => ({
          issueId: issue.id,
          labelId,
        })),
      });
    }

    // Log activity
    await prisma.activity.create({
      data: {
        projectId,
        issueId: issue.id,
        userId: reporterId,
        action: "CREATE_ISSUE",
        details: {
          issueTitle: title,
          issueType,
          priority,
        },
      },
    });

    // Create notification if issue is assigned to someone
    if (assigneeId && assigneeId !== reporterId) {
      try {
        const reporter = await prisma.user.findUnique({
          where: { id: reporterId },
          select: { fullName: true },
        });

        await notificationService.createIssueAssignedNotification(
          assigneeId,
          title,
          issue.project.name,
          reporter.fullName,
          issue.id
        );
      } catch (error) {
        console.error("Failed to create issue assignment notification:", error);
      }
    }

    return issue;
  }

  async updateIssue(id, updateData) {
    // Check if issue exists
    const existingIssue = await this.getIssueById(id);

    const {
      title,
      description,
      issueType,
      priority,
      storyPoints,
      dueDate,
      labelIds,
      status
    } = updateData;

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(issueType && { issueType }),
        ...(priority && { priority }),
        ...(storyPoints !== undefined && { storyPoints }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(status && { status }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Update labels if provided
    if (labelIds !== undefined) {
      // Remove existing labels
      await prisma.issueLabelRelation.deleteMany({
        where: { issueId: id },
      });

      // Add new labels
      if (labelIds.length > 0) {
        await prisma.issueLabelRelation.createMany({
          data: labelIds.map((labelId) => ({
            issueId: id,
            labelId,
          })),
        });
      }
    }

    return updatedIssue;
  }

  async deleteIssue(id) {
    // Check if issue exists
    await this.getIssueById(id);

    await prisma.issue.delete({
      where: { id },
    });

    return true;
  }

  async getProjectIssues(projectId, filters = {}) {
    const { status, assignee, priority, issueType, search } = filters;

    const where = { projectId };
    if (status) where.status = status;
    if (assignee) where.assigneeId = assignee;
    if (priority) where.priority = priority;
    if (issueType) where.issueType = issueType;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const issues = await prisma.issue.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        labelRelations: {
          include: {
            label: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });

    return issues.map((issue) => ({
      ...issue,
      labels: issue.labelRelations.map((rel) => rel.label),
      commentCount: issue._count.comments,
    }));
  }

  async updateIssueStatus(id, status, userId) {
    const issue = await this.getIssueById(id);
    const oldStatus = issue.status;

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: { status },
      include: {
        assignee: {
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
        projectId: issue.projectId,
        issueId: id,
        userId,
        action: "UPDATE_STATUS",
        details: {
          fromStatus: oldStatus,
          toStatus: status,
        },
      },
    });

    // Create notification for assignee if status changes and issue is assigned
    if (issue.assigneeId && issue.assigneeId !== userId) {
      try {
        const statusChanger = await prisma.user.findUnique({
          where: { id: userId },
          select: { fullName: true },
        });

        await notificationService.createIssueStatusChangeNotification(
          issue.assigneeId,
          issue.title,
          status,
          statusChanger.fullName,
          id
        );
      } catch (error) {
        console.error("Failed to create status change notification:", error);
      }
    }

    return updatedIssue;
  }

  async assignIssue(id, assigneeId, userId) {
    const issue = await this.getIssueById(id);

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: { assigneeId },
      include: {
        assignee: {
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
        projectId: issue.projectId,
        issueId: id,
        userId,
        action: "ASSIGN_ISSUE",
        details: {
          assigneeName: updatedIssue.assignee?.fullName,
        },
      },
    });

    // Create notification for assigned user
    if (assigneeId && assigneeId !== userId) {
      try {
        const assigner = await prisma.user.findUnique({
          where: { id: userId },
          select: { fullName: true },
        });

        await notificationService.createIssueAssignedNotification(
          assigneeId,
          issue.title,
          issue.project.name,
          assigner.fullName,
          id
        );
      } catch (error) {
        console.error("Failed to create issue assignment notification:", error);
      }
    }

    return updatedIssue;
  }

  async getIssueComments(issueId) {
    // Check if issue exists
    await this.getIssueById(issueId);

    const comments = await prisma.issueComment.findMany({
      where: { issueId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return comments;
  }

  async addIssueComment(commentData) {
    const { issueId, authorId, content } = commentData;

    // Check if issue exists
    const issue = await this.getIssueById(issueId);

    const comment = await prisma.issueComment.create({
      data: {
        issueId,
        authorId,
        content,
      },
      include: {
        author: {
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
        projectId: issue.projectId,
        issueId,
        userId: authorId,
        action: "ADD_COMMENT",
        details: {
          commentPreview: content.substring(0, 100),
        },
      },
    });

    // Create notifications for issue assignee and reporter (if different from comment author)
    try {
      const notifyUsers = new Set();
      
      if (issue.assigneeId && issue.assigneeId !== authorId) {
        notifyUsers.add(issue.assigneeId);
      }
      
      if (issue.reporterId && issue.reporterId !== authorId) {
        notifyUsers.add(issue.reporterId);
      }

      for (const userId of notifyUsers) {
        await notificationService.createIssueCommentNotification(
          userId,
          issue.title,
          comment.author.fullName,
          issueId
        );
      }
    } catch (error) {
      console.error("Failed to create comment notification:", error);
    }

    return comment;
  }
}

module.exports = new IssueService();
