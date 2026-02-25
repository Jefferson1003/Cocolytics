#!/usr/bin/env node

/**
 * Setup Notifications System
 * Run this script to initialize the notifications database tables
 * 
 * Usage: node setup-notifications.js
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

async function setupNotifications() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cocolytics',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('🔄 Setting up Notifications System...\n');

    // Create notifications table
    console.log('📋 Creating notifications table...');
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS notifications (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        alert_type ENUM('LOW_STOCK', 'DRYING_DELAY', 'DAILY_SUMMARY', 'ORDER_UPDATE', 'SYSTEM') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        related_product_id INT,
        related_order_id INT,
        severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        read_at DATETIME,
        role_target ENUM('all', 'admin', 'staff', 'user') DEFAULT 'all',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY alert_type (alert_type),
        KEY is_read (is_read),
        KEY created_at (created_at),
        KEY role_target (role_target),
        CONSTRAINT notifications_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT notifications_ibfk_2 FOREIGN KEY (related_product_id) REFERENCES cocolumber_logs(id) ON DELETE SET NULL,
        CONSTRAINT notifications_ibfk_3 FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    );
    console.log('✅ Notifications table created\n');

    // Create alert_rules table
    console.log('📋 Creating alert_rules table...');
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS alert_rules (
        id INT NOT NULL AUTO_INCREMENT,
        rule_type ENUM('LOW_STOCK', 'DRYING_DELAY', 'DAILY_SUMMARY') NOT NULL,
        threshold_value INT,
        description VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY rule_type (rule_type),
        KEY is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    );
    console.log('✅ Alert rules table created\n');

    // Create drying_logs table
    console.log('📋 Creating drying_logs table...');
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS drying_logs (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        batch_number VARCHAR(100),
        start_date DATETIME NOT NULL,
        expected_end_date DATETIME NOT NULL,
        actual_end_date DATETIME,
        status ENUM('in_progress', 'completed', 'delayed') DEFAULT 'in_progress',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY product_id (product_id),
        KEY status (status),
        KEY expected_end_date (expected_end_date),
        CONSTRAINT drying_logs_ibfk_1 FOREIGN KEY (product_id) REFERENCES cocolumber_logs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    );
    console.log('✅ Drying logs table created\n');

    // Create notification_preferences table
    console.log('📋 Creating notification_preferences table...');
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS notification_preferences (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        LOW_STOCK_ENABLED BOOLEAN DEFAULT TRUE,
        DRYING_DELAY_ENABLED BOOLEAN DEFAULT TRUE,
        DAILY_SUMMARY_ENABLED BOOLEAN DEFAULT TRUE,
        ORDER_UPDATE_ENABLED BOOLEAN DEFAULT TRUE,
        summary_time TIME DEFAULT '09:00:00',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY user_id (user_id),
        CONSTRAINT notif_pref_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    );
    console.log('✅ Notification preferences table created\n');

    // Insert default alert rules
    console.log('⚙️  Inserting default alert rules...');
    const [rules] = await pool.execute(`SELECT COUNT(*) as count FROM alert_rules`);
    if (rules[0].count === 0) {
      await pool.execute(
        `INSERT INTO alert_rules (rule_type, threshold_value, description) VALUES
        ('LOW_STOCK', 10, 'Alert when product stock falls below 10 units'),
        ('DRYING_DELAY', 1, 'Alert when drying process exceeds expected end date by 1 day'),
        ('DAILY_SUMMARY', 0, 'Send daily summary of all activities')`
      );
      console.log('✅ Default alert rules inserted\n');
    } else {
      console.log('ℹ️  Alert rules already exist\n');
    }

    console.log('✨ ========================================');
    console.log('✨ Notifications System Setup Complete! ✨');
    console.log('✨ ========================================\n');
    
    console.log('📋 Features Enabled:');
    console.log('   ✓ 7.1 - Alert Logic');
    console.log('   ✓ 7.2 - Low Stock Alerts');
    console.log('   ✓ 7.3 - Drying Delay Alerts');
    console.log('   ✓ 7.4 - Daily Summary Notifications');
    console.log('   ✓ 7.5 - Role-Based Alert Delivery\n');

    console.log('🔗 API Endpoints:');
    console.log('   GET  /api/notifications              - Get all notifications');
    console.log('   GET  /api/notifications/unread/count - Get unread count');
    console.log('   PUT  /api/notifications/:id/read     - Mark as read');
    console.log('   PUT  /api/notifications/mark-all/read - Mark all as read');
    console.log('   DELETE /api/notifications/:id        - Delete notification');
    console.log('   GET  /api/notifications/preferences  - Get preferences');
    console.log('   PUT  /api/notifications/preferences  - Update preferences');
    console.log('   POST /api/notifications/test         - Send test notification (Admin)');
    console.log('   POST /api/notifications/trigger-checks - Trigger alert checks (Admin)');
    console.log('   POST /api/notifications/generate-summaries - Generate summaries (Admin)\n');

    console.log('⏰ Automatic Processes:');
    console.log('   • Alert checks run every 30 minutes');
    console.log('   • Daily summaries generated at 9:00 AM\n');

    console.log('🎯 Frontend:');
    console.log('   • Route: /notifications');
    console.log('   • Component: NotificationsCenter.vue');
    console.log('   • Page: NotificationsPage.vue\n');

    await pool.end();
  } catch (error) {
    console.error('❌ Error setting up notifications:', error);
    process.exit(1);
  }
}

setupNotifications();
