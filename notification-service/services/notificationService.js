const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Notification Creation Methods
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      
      // Send notifications based on user preferences
      await this.sendNotifications(notification);
      
      return notification;
    } catch (error) {
      throw error;
    }
  }

  async createEventNotification(userId, eventId, type, eventData) {
    try {
      const notification = await this.createNotification({
        userId,
        type,
        title: this.getEventNotificationTitle(type, eventData),
        content: this.getEventNotificationContent(type, eventData),
        relatedId: eventId,
        relatedType: 'event',
        metadata: eventData
      });
      return notification;
    } catch (error) {
      throw error;
    }
  }

  async createCircleNotification(userId, circleId, type, circleData) {
    try {
      const notification = await this.createNotification({
        userId,
        type,
        title: this.getCircleNotificationTitle(type, circleData),
        content: this.getCircleNotificationContent(type, circleData),
        relatedId: circleId,
        relatedType: 'circle',
        metadata: circleData
      });
      return notification;
    } catch (error) {
      throw error;
    }
  }

  // Notification Retrieval Methods
  async getNotificationsByUser(userId, { limit = 20, skip = 0, read = null } = {}) {
    try {
      const query = { userId };
      if (read !== null) {
        query.read = read;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return notifications;
    } catch (error) {
      throw error;
    }
  }

  async getUnreadNotificationsCount(userId) {
    try {
      const count = await Notification.countDocuments({
        userId,
        read: false
      });
      return count;
    } catch (error) {
      throw error;
    }
  }

  // Notification Update Methods
  async markAsRead(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      notification.markAsRead();
      await notification.save();
      return notification;
    } catch (error) {
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { userId, read: false },
        { $set: { read: true, readAt: new Date() } }
      );
    } catch (error) {
      throw error;
    }
  }

  // Notification Delivery Methods
  async sendNotifications(notification) {
    try {
      // Send email notification
      if (notification.deliveryStatus.email.sent === false) {
        await this.sendEmailNotification(notification);
      }

      // Send push notification
      if (notification.deliveryStatus.push.sent === false) {
        await this.sendPushNotification(notification);
      }

      // In-app notification is already sent by default
    } catch (error) {
      throw error;
    }
  }

  async sendEmailNotification(notification) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: notification.userId.email,
        subject: notification.title,
        text: notification.content
      };

      await this.transporter.sendMail(mailOptions);
      notification.updateDeliveryStatus('email', true);
      await notification.save();
    } catch (error) {
      throw error;
    }
  }

  async sendPushNotification(notification) {
    try {
      // Implement push notification logic here
      // This would typically involve sending to a push notification service
      notification.updateDeliveryStatus('push', true);
      await notification.save();
    } catch (error) {
      throw error;
    }
  }

  // Helper Methods
  getEventNotificationTitle(type, eventData) {
    const titles = {
      'event_invitation': `Invitation: ${eventData.title}`,
      'event_update': `Update: ${eventData.title}`,
      'event_reminder': `Reminder: ${eventData.title}`
    };
    return titles[type] || 'Event Notification';
  }

  getEventNotificationContent(type, eventData) {
    const contents = {
      'event_invitation': `You've been invited to ${eventData.title} on ${eventData.date.start}`,
      'event_update': `There's an update for ${eventData.title}`,
      'event_reminder': `Don't forget about ${eventData.title} starting soon!`
    };
    return contents[type] || 'Event notification content';
  }

  getCircleNotificationTitle(type, circleData) {
    const titles = {
      'circle_invitation': `Invitation: ${circleData.name}`,
      'circle_update': `Update: ${circleData.name}`
    };
    return titles[type] || 'Circle Notification';
  }

  getCircleNotificationContent(type, circleData) {
    const contents = {
      'circle_invitation': `You've been invited to join ${circleData.name}`,
      'circle_update': `There's an update in ${circleData.name}`
    };
    return contents[type] || 'Circle notification content';
  }
}

module.exports = new NotificationService(); 