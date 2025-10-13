const notificationService = require("./notificationService");
const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");
const socketManager = require("../../utils/socketManager");

class NotificationController {
  getUserNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { isRead, limit, offset, type } = req.query;

    const options = {
      isRead: isRead !== undefined ? isRead === "true" : undefined,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
      type,
    };

    const result = await notificationService.getUserNotifications(userId, options);
    
    return sendResponse(res, 200, result, "Notifications retrieved successfully");
  });

  markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationService.markAsRead(id, userId);
    
    return sendResponse(res, 200, notification, "Notification marked as read");
  });

  markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await notificationService.markAllAsRead(userId);
    
    return sendResponse(res, 200, result, "All notifications marked as read");
  });

  deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await notificationService.deleteNotification(id, userId);
    
    return sendResponse(res, 200, null, "Notification deleted successfully");
  });

  getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const count = await notificationService.getUnreadCount(userId);
    
    return sendResponse(res, 200, { count }, "Unread count retrieved successfully");
  });

  // Get socket connection status
  getConnectionStatus = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const isOnline = socketManager.isUserOnline(userId);
    const onlineUsersCount = socketManager.getOnlineUsersCount();
    
    return sendResponse(res, 200, {
      isOnline,
      onlineUsersCount,
      userId
    }, "Connection status retrieved successfully");
  });

  // Send test notification (for debugging)
  sendTestNotification = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { title, message } = req.body;

    const notification = await notificationService.createNotification({
      userId,
      type: "GENERAL",
      title: title || "Test Notification",
      message: message || "This is a test notification",
      actionUrl: "/dashboard"
    });

    return sendResponse(res, 200, notification, "Test notification sent successfully");
  });
}

module.exports = new NotificationController();