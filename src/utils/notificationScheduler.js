const cron = require('node-cron');
const notificationService = require('../api/notifications/notificationService');

class NotificationScheduler {
  start() {
    // Clean up old notifications every day at 2 AM
    cron.schedule('0 2 * * *', async () => {
      try {
        console.log('🧹 Running notification cleanup...');
        const result = await notificationService.cleanupOldNotifications(30);
        console.log(`✅ Cleaned up ${result.count} old notifications`);
      } catch (error) {
        console.error('❌ Notification cleanup failed:', error);
      }
    });

    console.log('📅 Notification scheduler started');
  }
}

module.exports = new NotificationScheduler();