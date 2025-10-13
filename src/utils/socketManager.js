const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketManager {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // Map userId to socketId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["authorization"]
      }
    });

    // Authentication middleware for socket connections
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userEmail = decoded.email;
        
        console.log(`🔌 User ${decoded.email} connected via socket`);
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    console.log('🚀 Socket.IO server initialized');
  }

  handleConnection(socket) {
    const userId = socket.userId;
    
    // Store user-socket mapping
    this.userSockets.set(userId, socket.id);
    
    // Join user-specific room
    socket.join(`user_${userId}`);
    
    console.log(`✅ User ${userId} joined room user_${userId}`);

    // Handle client events
    socket.on('subscribe_notifications', () => {
      socket.join(`notifications_${userId}`);
      console.log(`🔔 User ${userId} subscribed to notifications`);
    });

    socket.on('mark_notification_read', async (data) => {
      try {
        const { notificationId } = data;
        // Emit to other devices of same user that notification was read
        socket.to(`user_${userId}`).emit('notification_read', { notificationId });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ User ${userId} disconnected`);
      this.userSockets.delete(userId);
    });
  }

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    try {
      // Send to user's room (all their devices)
      this.io.to(`user_${userId}`).emit('new_notification', {
        type: 'NEW_NOTIFICATION',
        data: notification,
        timestamp: new Date().toISOString()
      });

      console.log(`📤 Notification sent to user ${userId}:`, notification.title);
    } catch (error) {
      console.error('Error sending notification via socket:', error);
    }
  }

  // Send notification update (read, deleted, etc.)
  sendNotificationUpdate(userId, updateData) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    try {
      this.io.to(`user_${userId}`).emit('notification_update', {
        type: 'NOTIFICATION_UPDATE',
        data: updateData,
        timestamp: new Date().toISOString()
      });

      console.log(`📝 Notification update sent to user ${userId}`);
    } catch (error) {
      console.error('Error sending notification update via socket:', error);
    }
  }

  // Send unread count update
  sendUnreadCountUpdate(userId, unreadCount) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    try {
      this.io.to(`user_${userId}`).emit('unread_count_update', {
        type: 'UNREAD_COUNT_UPDATE',
        data: { count: unreadCount },
        timestamp: new Date().toISOString()
      });

      console.log(`🔢 Unread count update sent to user ${userId}: ${unreadCount}`);
    } catch (error) {
      console.error('Error sending unread count update via socket:', error);
    }
  }

  // Broadcast to multiple users (e.g., project members)
  broadcastToUsers(userIds, eventName, data) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    try {
      userIds.forEach(userId => {
        this.io.to(`user_${userId}`).emit(eventName, {
          type: eventName.toUpperCase(),
          data,
          timestamp: new Date().toISOString()
        });
      });

      console.log(`📡 Broadcast ${eventName} to ${userIds.length} users`);
    } catch (error) {
      console.error('Error broadcasting to users:', error);
    }
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.userSockets.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }

  // Get all online users
  getOnlineUsers() {
    return Array.from(this.userSockets.keys());
  }
}

module.exports = new SocketManager();