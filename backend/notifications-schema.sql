-- Notifications System Schema
-- This file creates all necessary tables for the notifications system

-- Table for storing notifications
CREATE TABLE IF NOT EXISTS notifications (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for alert rules/settings
CREATE TABLE IF NOT EXISTS alert_rules (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for tracking drying processes
CREATE TABLE IF NOT EXISTS drying_logs (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for user notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default alert rules
INSERT INTO alert_rules (rule_type, threshold_value, description) VALUES
('LOW_STOCK', 10, 'Alert when product stock falls below 10 units'),
('DRYING_DELAY', 1, 'Alert when drying process exceeds expected end date by 1 day'),
('DAILY_SUMMARY', 0, 'Send daily summary of all activities')
ON DUPLICATE KEY UPDATE rule_type = VALUES(rule_type);
