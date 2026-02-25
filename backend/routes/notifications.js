/**
 * Notification Routes
 * API endpoints for notification management
 */

const express = require('express');
const router = express.Router();

module.exports = (NotificationService, pool) => {
  const notificationService = new NotificationService(pool);

  /**
   * GET /api/notifications
   * Get all notifications for authenticated user
   */
  router.get('/', async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const result = await notificationService.getUserNotifications(
        req.user.id,
        req.user.role,
        limit,
        offset
      );

      res.json({
        success: true,
        data: result.data,
        total: result.total,
        limit,
        offset
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  /**
   * GET /api/notifications/unread/count
   * Get unread notification count
   */
  router.get('/unread/count', async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const unreadCount = await notificationService.getUnreadCount(req.user.id);

      res.json({
        success: true,
        unreadCount
      });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  });

  /**
   * PUT /api/notifications/:id/read
   * Mark notification as read
   */
  router.put('/:id/read', async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await notificationService.markAsRead(req.params.id);

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  /**
   * PUT /api/notifications/mark-all/read
   * Mark all notifications as read
   */
  router.put('/mark-all/read', async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await notificationService.markAllAsRead(req.user.id);

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      res.status(500).json({ error: 'Failed to mark all as read' });
    }
  });

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  router.delete('/:id', async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await notificationService.deleteNotification(req.params.id);

      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  /**
   * GET /api/notifications/preferences
   * Get user notification preferences
   */
  router.get('/preferences', async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const preferences = await notificationService.getPreferences(req.user.id);

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
      res.status(500).json({ error: 'Failed to fetch preferences' });
    }
  });

  /**
   * PUT /api/notifications/preferences
   * Update user notification preferences
   */
  router.put('/preferences', async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { LOW_STOCK_ENABLED, DRYING_DELAY_ENABLED, DAILY_SUMMARY_ENABLED, ORDER_UPDATE_ENABLED, summary_time } = req.body;

      await notificationService.updatePreferences(req.user.id, {
        LOW_STOCK_ENABLED,
        DRYING_DELAY_ENABLED,
        DAILY_SUMMARY_ENABLED,
        ORDER_UPDATE_ENABLED,
        summary_time: summary_time || '09:00:00'
      });

      res.json({
        success: true,
        message: 'Preferences updated'
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  });

  /**
   * POST /api/notifications/test
   * Create a test notification (Admin only)
   */
  router.post('/test', async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { alert_type, title, message } = req.body;

      await notificationService.createNotification({
        user_id: req.user.id,
        alert_type: alert_type || 'SYSTEM',
        title: title || 'Test Notification',
        message: message || 'This is a test notification',
        severity: 'info',
        role_target: 'admin'
      });

      res.json({
        success: true,
        message: 'Test notification created'
      });
    } catch (error) {
      console.error('Error creating test notification:', error);
      res.status(500).json({ error: 'Failed to create test notification' });
    }
  });

  /**
   * POST /api/notifications/trigger-checks
   * Manually trigger alert checks (Admin only)
   */
  router.post('/trigger-checks', async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      await notificationService.checkAllAlerts();

      res.json({
        success: true,
        message: 'Alert checks triggered'
      });
    } catch (error) {
      console.error('Error triggering checks:', error);
      res.status(500).json({ error: 'Failed to trigger checks' });
    }
  });

  /**
   * POST /api/notifications/generate-summaries
   * Generate daily summaries (Admin only)
   */
  router.post('/generate-summaries', async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      await notificationService.createDailySummaries();

      res.json({
        success: true,
        message: 'Daily summaries generated'
      });
    } catch (error) {
      console.error('Error generating summaries:', error);
      res.status(500).json({ error: 'Failed to generate summaries' });
    }
  });

  return router;
};
