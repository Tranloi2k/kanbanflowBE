const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const socketManager = require("../../utils/socketManager");

class NotificationService {
  async createNotification(notificationData) {
    const {
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      actionUrl,
      metadata,
    } = notificationData;

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
        relatedType,
        actionUrl,
        metadata,
      },
    });

    // Send real-time notification via socket
    try {
      socketManager.sendNotificationToUser(userId, notification);
      
      // Also send updated unread count
      const unreadCount = await this.getUnreadCount(userId);
      socketManager.sendUnreadCountUpdate(userId, unreadCount);
    } catch (error) {
      console.error('Failed to send real-time notification:', error);
      // Don't fail the notification creation if socket fails
    }

    return notification;
  }

  async getUserNotifications(userId, options = {}) {
    const { isRead, limit = 20, offset = 0, type } = options;

    const where = {
      userId,
      ...(isRead !== undefined && { isRead }),
      ...(type && { type }),
    };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.notification.count({ where });

    return {
      notifications,
      total,
      hasMore: total > offset + limit,
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    if (notification.userId !== userId) {
      throw new ApiError(403, "You can only mark your own notifications as read");
    }

    if (notification.isRead) {
      throw new ApiError(400, "Notification is already read");
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Send real-time update via socket
    try {
      socketManager.sendNotificationUpdate(userId, {
        action: 'MARK_READ',
        notificationId,
        isRead: true,
        readAt: updatedNotification.readAt
      });

      // Send updated unread count
      const unreadCount = await this.getUnreadCount(userId);
      socketManager.sendUnreadCountUpdate(userId, unreadCount);
    } catch (error) {
      console.error('Failed to send real-time notification update:', error);
    }

    return updatedNotification;
  }

  async markAllAsRead(userId) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Send real-time update via socket
    try {
      socketManager.sendNotificationUpdate(userId, {
        action: 'MARK_ALL_READ',
        count: result.count
      });

      // Send updated unread count (should be 0)
      socketManager.sendUnreadCountUpdate(userId, 0);
    } catch (error) {
      console.error('Failed to send real-time mark all read update:', error);
    }

    return result;
  }

  async deleteNotification(notificationId, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    if (notification.userId !== userId) {
      throw new ApiError(403, "You can only delete your own notifications");
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    // Send real-time update via socket
    try {
      socketManager.sendNotificationUpdate(userId, {
        action: 'DELETE',
        notificationId
      });

      // Send updated unread count
      const unreadCount = await this.getUnreadCount(userId);
      socketManager.sendUnreadCountUpdate(userId, unreadCount);
    } catch (error) {
      console.error('Failed to send real-time notification delete update:', error);
    }

    return true;
  }

  async getUnreadCount(userId) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  }

  // Helper methods for creating specific notification types
  async createProjectInvitationNotification(userId, projectName, inviterName, invitationId) {
    return this.createNotification({
      userId,
      type: "PROJECT_INVITATION",
      title: "New Project Invitation",
      message: `${inviterName} invited you to join "${projectName}"`,
      relatedId: invitationId,
      relatedType: "invitation",
      actionUrl: `/projects/invitations/${invitationId}`,
      metadata: {
        projectName,
        inviterName,
      },
    });
  }

  async createIssueAssignedNotification(userId, issueTitle, projectName, assignerName, issueId) {
    return this.createNotification({
      userId,
      type: "ISSUE_ASSIGNED",
      title: "New Issue Assigned",
      message: `${assignerName} assigned you to "${issueTitle}" in ${projectName}`,
      relatedId: issueId,
      relatedType: "issue",
      actionUrl: `/projects/issues/${issueId}`,
      metadata: {
        issueTitle,
        projectName,
        assignerName,
      },
    });
  }

  async createIssueCommentNotification(userId, issueTitle, commenterName, issueId) {
    return this.createNotification({
      userId,
      type: "ISSUE_COMMENT",
      title: "New Comment",
      message: `${commenterName} commented on "${issueTitle}"`,
      relatedId: issueId,
      relatedType: "issue",
      actionUrl: `/projects/issues/${issueId}`,
      metadata: {
        issueTitle,
        commenterName,
      },
    });
  }

  async createIssueStatusChangeNotification(userId, issueTitle, newStatus, changerName, issueId) {
    return this.createNotification({
      userId,
      type: "ISSUE_STATUS_CHANGE",
      title: "Issue Status Changed",
      message: `${changerName} moved "${issueTitle}" to ${newStatus}`,
      relatedId: issueId,
      relatedType: "issue",
      actionUrl: `/projects/issues/${issueId}`,
      metadata: {
        issueTitle,
        newStatus,
        changerName,
      },
    });
  }

  async createProjectMemberAddedNotification(userId, projectName, adderName, projectId) {
    return this.createNotification({
      userId,
      type: "PROJECT_MEMBER_ADDED",
      title: "Added to Project",
      message: `${adderName} added you to "${projectName}"`,
      relatedId: projectId,
      relatedType: "project",
      actionUrl: `/projects/${projectId}`,
      metadata: {
        projectName,
        adderName,
      },
    });
  }

  async createRoleUpdatedNotification(userId, projectName, newRole, updaterName, projectId) {
    return this.createNotification({
      userId,
      type: "PROJECT_ROLE_UPDATED",
      title: "Role Updated",
      message: `${updaterName} changed your role to ${newRole} in "${projectName}"`,
      relatedId: projectId,
      relatedType: "project",
      actionUrl: `/projects/${projectId}`,
      metadata: {
        projectName,
        newRole,
        updaterName,
      },
    });
  }

  // Clean up old notifications (older than 30 days)
  async cleanupOldNotifications(daysBefore = 30) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBefore);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: dateThreshold,
        },
        isRead: true,
      },
    });

    return result;
  }
}

module.exports = new NotificationService();