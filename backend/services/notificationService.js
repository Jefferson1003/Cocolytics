/**
 * Notification Service
 * Handles all notification logic including:
 * - Low stock alerts
 * - Drying delay alerts
 * - Daily summary notifications
 * - Role-based delivery
 */

class NotificationService {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * 7.1 - Develop alert logic
   * Main function to check and generate alerts
   */
  async checkAllAlerts() {
    try {
      console.log('🔔 Running all alert checks...');
      
      await this.checkLowStockAlerts();
      await this.checkDryingDelayAlerts();
      
      console.log('✅ Alert checks completed');
    } catch (error) {
      console.error('❌ Error checking alerts:', error);
    }
  }

  /**
   * 7.2 - Implement low stock alerts
   * Checks for products below threshold and creates alerts
   */
  async checkLowStockAlerts() {
    try {
      const [rules] = await this.pool.execute(
        `SELECT * FROM alert_rules WHERE rule_type = 'LOW_STOCK' AND is_active = TRUE`
      );

      if (rules.length === 0) {
        console.log('ℹ️  No active LOW_STOCK rules');
        return;
      }

      const threshold = rules[0].threshold_value || 10;

      // Find products below threshold
      const [lowStockProducts] = await this.pool.execute(
        `SELECT id, size, length, stock FROM cocolumber_logs WHERE stock <= ? AND stock > 0 ORDER BY stock ASC`,
        [threshold]
      );

      for (const product of lowStockProducts) {
        // Check if alert already exists for today
        const [existingAlert] = await this.pool.execute(
          `SELECT id FROM notifications 
           WHERE related_product_id = ? 
           AND alert_type = 'LOW_STOCK' 
           AND DATE(created_at) = CURDATE()`,
          [product.id]
        );

        if (existingAlert.length === 0) {
          // Create alert for admin and staff
          const message = `Product ${product.size} (${product.length}m) has low stock: ${product.stock} units`;
          
          // Get admin and staff users
          const [adminStaffUsers] = await this.pool.execute(
            `SELECT id FROM users WHERE role IN ('admin', 'staff')`
          );

          for (const user of adminStaffUsers) {
            await this.createNotification({
              user_id: user.id,
              alert_type: 'LOW_STOCK',
              title: '⚠️ Low Stock Alert',
              message: message,
              related_product_id: product.id,
              severity: product.stock <= 3 ? 'critical' : 'warning',
              role_target: user.role === 'admin' ? 'admin' : 'staff'
            });
          }

          console.log(`📦 Low stock alert created for product ${product.id}: ${product.stock} units`);
        }
      }
    } catch (error) {
      console.error('❌ Error in checkLowStockAlerts:', error);
    }
  }

  /**
   * 7.3 - Implement drying delay alerts
   * Checks for delayed drying processes
   */
  async checkDryingDelayAlerts() {
    try {
      const [rules] = await this.pool.execute(
        `SELECT * FROM alert_rules WHERE rule_type = 'DRYING_DELAY' AND is_active = TRUE`
      );

      if (rules.length === 0) {
        console.log('ℹ️  No active DRYING_DELAY rules');
        return;
      }

      const delayHours = (rules[0].threshold_value || 1) * 24;

      // Find delayed drying processes
      const [delayedDrying] = await this.pool.execute(
        `SELECT dl.id, dl.product_id, dl.batch_number, dl.expected_end_date, cl.size, cl.length
         FROM drying_logs dl
         JOIN cocolumber_logs cl ON dl.product_id = cl.id
         WHERE dl.status = 'in_progress'
         AND dl.expected_end_date < DATE_SUB(NOW(), INTERVAL ? HOUR)
         AND dl.id NOT IN (
           SELECT related_product_id FROM notifications 
           WHERE alert_type = 'DRYING_DELAY' 
           AND DATE(created_at) = CURDATE()
         )`,
        [delayHours]
      );

      for (const drying of delayedDrying) {
        const delayMinutes = Math.round(
          (Date.now() - new Date(drying.expected_end_date).getTime()) / 60000
        );
        const message = `Batch ${drying.batch_number} (Product ${drying.size}) drying delayed by ${Math.round(delayMinutes / 60)} hours`;

        // Get admin and staff users
        const [adminStaffUsers] = await this.pool.execute(
          `SELECT id FROM users WHERE role IN ('admin', 'staff')`
        );

        for (const user of adminStaffUsers) {
          await this.createNotification({
            user_id: user.id,
            alert_type: 'DRYING_DELAY',
            title: '⏱️ Drying Process Delayed',
            message: message,
            related_product_id: drying.product_id,
            severity: 'warning',
            role_target: user.role === 'admin' ? 'admin' : 'staff'
          });
        }

        console.log(`⏱️ Drying delay alert created for batch ${drying.batch_number}`);
      }
    } catch (error) {
      console.error('❌ Error in checkDryingDelayAlerts:', error);
    }
  }

  /**
   * 7.4 - Create daily summary notifications
   * Generates daily summary for each user based on their role
   */
  async createDailySummaries() {
    try {
      console.log('📊 Generating daily summaries...');

      const [users] = await this.pool.execute(
        `SELECT DISTINCT u.id, u.role, np.summary_time
         FROM users u
         LEFT JOIN notification_preferences np ON u.id = np.user_id
         WHERE u.role IN ('admin', 'staff', 'user')`
      );

      for (const user of users) {
        // Check if summary already created today
        const [existingSummary] = await this.pool.execute(
          `SELECT id FROM notifications 
           WHERE user_id = ? 
           AND alert_type = 'DAILY_SUMMARY' 
           AND DATE(created_at) = CURDATE()`,
          [user.id]
        );

        if (existingSummary.length === 0) {
          const summary = await this.generateSummaryContent(user.id, user.role);
          
          if (summary.content) {
            await this.createNotification({
              user_id: user.id,
              alert_type: 'DAILY_SUMMARY',
              title: '📋 Daily Summary',
              message: summary.content,
              severity: 'info',
              role_target: user.role
            });

            console.log(`📊 Daily summary created for ${user.role} user ${user.id}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error creating daily summaries:', error);
    }
  }

  /**
   * Generate role-specific summary content
   */
  async generateSummaryContent(userId, role) {
    try {
      let content = '';
      const today = new Date().toISOString().split('T')[0];

      if (role === 'admin') {
        // Admin gets complete summary
        const [stats] = await this.pool.execute(
          `SELECT 
            COUNT(*) as total_orders,
            SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending_orders,
            SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed_orders
           FROM orders WHERE DATE(created_at) = ?`,
          [today]
        );

        const [stockStats] = await this.pool.execute(
          `SELECT COUNT(*) as low_stock_items FROM cocolumber_logs WHERE stock <= 10`
        );

        const [dryingStats] = await this.pool.execute(
          `SELECT COUNT(*) as delayed_drying FROM drying_logs WHERE status='in_progress' AND expected_end_date < NOW()`
        );

        content = `
📊 Today's Summary (Admin):
• Total Orders: ${stats[0].total_orders}
• Pending: ${stats[0].pending_orders}, Completed: ${stats[0].completed_orders}
• Low Stock Items: ${stockStats[0].low_stock_items}
• Delayed Drying: ${dryingStats[0].delayed_drying}
        `.trim();

      } else if (role === 'staff') {
        // Staff gets inventory and orders summary
        const [staffOrders] = await this.pool.execute(
          `SELECT COUNT(*) as total FROM orders WHERE DATE(created_at) = ?`,
          [today]
        );

        const [inventoryAlerts] = await this.pool.execute(
          `SELECT COUNT(*) as count FROM notifications 
           WHERE user_id = ? AND alert_type IN ('LOW_STOCK', 'DRYING_DELAY') 
           AND DATE(created_at) = ?`,
          [userId, today]
        );

        content = `
📋 Daily Staff Summary:
• Orders Today: ${staffOrders[0].total}
• Active Alerts: ${inventoryAlerts[0].count}
        `.trim();

      } else if (role === 'user') {
        // Users get their order summary
        const [userOrders] = await this.pool.execute(
          `SELECT COUNT(*) as total FROM orders WHERE user_id = ? AND DATE(created_at) = ?`,
          [userId, today]
        );

        content = `
📦 Your Orders Summary:
• Orders Placed Today: ${userOrders[0].total}
        `.trim();
      }

      return { content };
    } catch (error) {
      console.error('❌ Error generating summary content:', error);
      return { content: null };
    }
  }

  /**
   * 7.5 - Apply role-based alert delivery
   * Creates a notification with role-based targeting
   */
  async createNotification(data) {
    try {
      const {
        user_id,
        alert_type,
        title,
        message,
        related_product_id,
        related_order_id,
        severity = 'info',
        role_target = 'all'
      } = data;

      const [result] = await this.pool.execute(
        `INSERT INTO notifications 
        (user_id, alert_type, title, message, related_product_id, related_order_id, severity, role_target)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, alert_type, title, message, related_product_id, related_order_id, severity, role_target]
      );

      return result;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user with role-based filtering
   */
  async getUserNotifications(userId, role, limit = 50, offset = 0) {
    try {
      const [notifications] = await this.pool.execute(
        `SELECT n.* FROM notifications n
         JOIN users u ON n.user_id = u.id
         WHERE n.user_id = ? 
         AND (n.role_target = 'all' OR n.role_target = ?)
         ORDER BY n.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, role, limit, offset]
      );

      const [total] = await this.pool.execute(
        `SELECT COUNT(*) as total FROM notifications n
         WHERE n.user_id = ? 
         AND (n.role_target = 'all' OR n.role_target = ?)`,
        [userId, role]
      );

      return {
        data: notifications,
        total: total[0].total
      };
    } catch (error) {
      console.error('❌ Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      await this.pool.execute(
        `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ?`,
        [notificationId]
      );
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    try {
      await this.pool.execute(
        `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE`,
        [userId]
      );
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      await this.pool.execute(
        `DELETE FROM notifications WHERE id = ?`,
        [notificationId]
      );
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    try {
      const [result] = await this.pool.execute(
        `SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE`,
        [userId]
      );

      return result[0].unread;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(userId, preferences) {
    try {
      const { LOW_STOCK_ENABLED, DRYING_DELAY_ENABLED, DAILY_SUMMARY_ENABLED, ORDER_UPDATE_ENABLED, summary_time } = preferences;

      await this.pool.execute(
        `INSERT INTO notification_preferences 
        (user_id, LOW_STOCK_ENABLED, DRYING_DELAY_ENABLED, DAILY_SUMMARY_ENABLED, ORDER_UPDATE_ENABLED, summary_time)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        LOW_STOCK_ENABLED = VALUES(LOW_STOCK_ENABLED),
        DRYING_DELAY_ENABLED = VALUES(DRYING_DELAY_ENABLED),
        DAILY_SUMMARY_ENABLED = VALUES(DAILY_SUMMARY_ENABLED),
        ORDER_UPDATE_ENABLED = VALUES(ORDER_UPDATE_ENABLED),
        summary_time = VALUES(summary_time)`,
        [userId, LOW_STOCK_ENABLED, DRYING_DELAY_ENABLED, DAILY_SUMMARY_ENABLED, ORDER_UPDATE_ENABLED, summary_time]
      );
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(userId) {
    try {
      const [preferences] = await this.pool.execute(
        `SELECT * FROM notification_preferences WHERE user_id = ?`,
        [userId]
      );

      if (preferences.length === 0) {
        // Return defaults
        return {
          user_id: userId,
          LOW_STOCK_ENABLED: true,
          DRYING_DELAY_ENABLED: true,
          DAILY_SUMMARY_ENABLED: true,
          ORDER_UPDATE_ENABLED: true,
          summary_time: '09:00:00'
        };
      }

      return preferences[0];
    } catch (error) {
      console.error('❌ Error getting preferences:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
