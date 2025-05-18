const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');

class NotificationController {
  // Notification Creation Controllers
  async createNotification(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const notification = await notificationService.createNotification({
        ...req.body,
        userId: req.user.id
      });

      res.status(201).json({
        success: true,
        data: notification
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async createEventNotification(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { eventId, type, eventData } = req.body;
      const notification = await notificationService.createEventNotification(
        req.user.id,
        eventId,
        type,
        eventData
      );

      res.status(201).json({
        success: true,
        data: notification
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async createCircleNotification(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { circleId, type, circleData } = req.body;
      const notification = await notificationService.createCircleNotification(
        req.user.id,
        circleId,
        type,
        circleData
      );

      res.status(201).json({
        success: true,
        data: notification
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Notification Retrieval Controllers
  async getNotifications(req, res) {
    try {
      const { limit = 20, skip = 0, read = null } = req.query;
      const notifications = await notificationService.getNotificationsByUser(
        req.user.id,
        { limit: parseInt(limit), skip: parseInt(skip), read: read === 'true' ? true : read === 'false' ? false : null }
      );

      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const count = await notificationService.getUnreadNotificationsCount(req.user.id);
      res.status(200).json({
        success: true,
        data: { count }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Notification Update Controllers
  async markAsRead(req, res) {
    try {
      const notification = await notificationService.markAsRead(req.params.id);
      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Notification Delivery Controllers
  async sendEmailNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const notification = await notificationService.sendEmailNotification(notificationId);
      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async sendPushNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const notification = await notificationService.sendPushNotification(notificationId);
      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new NotificationController(); 