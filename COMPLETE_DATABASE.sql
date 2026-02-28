-- ==========================================
-- COCOLYTICS COMPLETE DATABASE SCHEMA
-- All-in-One Database Setup
-- Generated: February 28, 2026
-- ==========================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ==========================================
-- CREATE DATABASE
-- ==========================================
CREATE DATABASE IF NOT EXISTS `cocolytics` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cocolytics`;

-- ==========================================
-- DROP EXISTING TABLES (in correct order)
-- ==========================================
DROP TABLE IF EXISTS `refunds`;
DROP TABLE IF EXISTS `payment_logs`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `courier_updates`;
DROP TABLE IF EXISTS `shipment_tracking`;
DROP TABLE IF EXISTS `notification_preferences`;
DROP TABLE IF EXISTS `drying_logs`;
DROP TABLE IF EXISTS `alert_rules`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `conversation_participants`;
DROP TABLE IF EXISTS `chat_conversations`;
DROP TABLE IF EXISTS `order_history`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cocolumber_logs`;
DROP TABLE IF EXISTS `staff_profiles`;
DROP TABLE IF EXISTS `paper_uploads`;
DROP TABLE IF EXISTS `users`;

-- ==========================================
-- TABLE: users (Authentication & Roles)
-- ==========================================
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` ENUM('user','staff','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample users (password: Staff123 for all)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'BULILIT', 'jeffbala@gmail.com', '$2a$10$WXI7ZE.Z5Sx9Y3u0HhAWSumpZKcvjt3WxJrlLWSC2vge1kUh8g79a', 'user', '2026-01-20 14:18:26'),
(2, 'Admin User', 'admin@gmail.com', '$2a$10$Nlqid0N48er781AnPaF5w.6RBxezWdS.xRcky.GnL3Py3YiFhSd1K', 'admin', '2026-01-20 14:26:05'),
(3, 'Staff User', 'staff@gmail.com', '$2a$10$Nlqid0N48er781AnPaF5w.piZ3fdQzM3gF1gpwBTikNZWsOwKpH2S', 'staff', '2026-01-20 14:26:05'),
(4, 'Regular User', 'user@gmail.com', '$2a$10$Nlqid0N48er781AnPaF5w.Cu9T12zWFRK9RFoktQzTVEUkSpAGy3.', 'user', '2026-01-20 14:26:05'),
(5, 'Vina', 'vina@cocolytics.com', '$2a$10$UR5FNi1oz/FHYuLskxCUzOamAWpcyO05DF4zLyvNwo6HhA284Ae2e', 'staff', NOW()),
(6, 'Paolo', 'paolo@cocolytics.com', '$2a$10$UR5FNi1oz/FHYuLskxCUzOamAWpcyO05DF4zLyvNwo6HhA284Ae2e', 'staff', NOW()),
(7, 'Bala', 'bala@cocolytics.com', '$2a$10$UR5FNi1oz/FHYuLskxCUzOamAWpcyO05DF4zLyvNwo6HhA284Ae2e', 'staff', NOW());

-- ==========================================
-- TABLE: staff_profiles (Multi-Seller Stores)
-- ==========================================
CREATE TABLE `staff_profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `staff_id` INT NOT NULL,
  `store_name` VARCHAR(100) NOT NULL,
  `store_description` TEXT,
  `store_logo` VARCHAR(255),
  `contact_number` VARCHAR(20),
  `store_address` TEXT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_staff_id` (`staff_id`),
  CONSTRAINT `fk_staff_profile_user` FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample staff profiles
INSERT INTO `staff_profiles` (`staff_id`, `store_name`, `store_description`, `contact_number`, `is_active`) VALUES
(5, 'Vina Store', 'Premium coconut products handpicked by Vina. Quality guaranteed!', '+63 917 123 4567', TRUE),
(6, 'Paolo Store', 'Fresh coconuts directly from the farm. Paolo brings you the best!', '+63 918 234 5678', TRUE),
(7, 'Bala Store', 'Organic coconut selection by Bala. Healthy and delicious!', '+63 919 345 6789', TRUE);

-- ==========================================
-- TABLE: cocolumber_logs (Product Inventory)
-- ==========================================
CREATE TABLE `cocolumber_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `size` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `length` DECIMAL(10,2) NOT NULL,
  `stock` INT NOT NULL DEFAULT '0',
  `staff_id` INT DEFAULT NULL,
  `product_picture` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_size` (`size`),
  KEY `idx_stock` (`stock`),
  KEY `idx_staff_id` (`staff_id`),
  CONSTRAINT `fk_cocolumber_staff` FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample products for each seller
-- Vina Store Products
INSERT INTO `cocolumber_logs` (`size`, `length`, `stock`, `staff_id`) VALUES
('Extra Large', 26, 15, 5),
('Extra Large', 25, 22, 5),
('Large', 23, 28, 5),
('Large', 22, 45, 5),
('Medium', 19, 75, 5),
('Small', 15, 100, 5);

-- Paolo Store Products
INSERT INTO `cocolumber_logs` (`size`, `length`, `stock`, `staff_id`) VALUES
('Premium Large', 24, 12, 6),
('Premium Large', 23, 18, 6),
('Standard Large', 22, 25, 6),
('Standard Medium', 20, 55, 6),
('Economy', 14, 120, 6);

-- Bala Store Products
INSERT INTO `cocolumber_logs` (`size`, `length`, `stock`, `staff_id`) VALUES
('Organic Jumbo', 28, 8, 7),
('Organic Jumbo', 27, 14, 7),
('Organic XL', 26, 20, 7),
('Organic Large', 24, 29, 7),
('Organic Medium', 20, 70, 7);

-- ==========================================
-- TABLE: orders (Order Management)
-- ==========================================
CREATE TABLE `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `cocolumber_id` INT NOT NULL,
  `quantity` INT NOT NULL CHECK (`quantity` > 0),
  `status` ENUM('pending','preparing_shipment','shipped','delivered','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_status` ENUM('not_paid', 'pending', 'paid') DEFAULT 'not_paid',
  `paymongo_payment_id` VARCHAR(255),
  `total_amount` DECIMAL(10, 2),
  `paid_at` TIMESTAMP NULL,
  `courier_name` VARCHAR(100),
  `tracking_number` VARCHAR(100),
  `shipped_date` TIMESTAMP NULL,
  `delivered_date` TIMESTAMP NULL,
  `order_notes` TEXT COLLATE utf8mb4_unicode_ci,
  `total_price` DECIMAL(10,2) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `cocolumber_id` (`cocolumber_id`),
  KEY `idx_status` (`status`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`cocolumber_id`) REFERENCES `cocolumber_logs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample orders
INSERT INTO `orders` (`user_id`, `cocolumber_id`, `quantity`, `status`, `payment_status`, `order_notes`) VALUES
(1, 1, 5, 'completed', 'paid', 'Urgent delivery requested'),
(4, 2, 10, 'pending', 'not_paid', NULL),
(1, 3, 2, 'shipped', 'paid', 'Handle with care');

-- ==========================================
-- TABLE: order_history (Order Audit Trail)
-- ==========================================
CREATE TABLE `order_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `old_status` ENUM('pending','preparing_shipment','shipped','delivered','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` ENUM('pending','preparing_shipment','shipped','delivered','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` INT DEFAULT NULL,
  `change_reason` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `order_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  CONSTRAINT `order_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: paper_uploads (Document Management)
-- ==========================================
CREATE TABLE `paper_uploads` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` TEXT COLLATE utf8mb4_unicode_ci,
  `file_path` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` ENUM('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `reviewed_by` INT DEFAULT NULL,
  `review_note` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `idx_status` (`status`),
  CONSTRAINT `paper_uploads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `paper_uploads_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- CHAT SYSTEM TABLES
-- ==========================================

-- Chat Conversations
CREATE TABLE `chat_conversations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_message_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `idx_last_message` (`last_message_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversation Participants
CREATE TABLE `conversation_participants` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `conversation_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_read_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_conversation_user` (`conversation_id`, `user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_conversation_id` (`conversation_id`),
  CONSTRAINT `fk_conv_participant_conv` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conv_participant_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat Messages
CREATE TABLE `chat_messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `conversation_id` INT NOT NULL,
  `sender_id` INT NOT NULL,
  `message_text` TEXT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_messages_conversation_created` (`conversation_id`, `created_at`),
  KEY `idx_unread_messages` (`conversation_id`, `is_read`),
  CONSTRAINT `fk_message_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_message_sender` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- NOTIFICATIONS SYSTEM TABLES
-- ==========================================

-- Notifications
CREATE TABLE `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `alert_type` ENUM('LOW_STOCK', 'DRYING_DELAY', 'DAILY_SUMMARY', 'ORDER_UPDATE', 'SYSTEM', 'MESSAGE') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `related_product_id` INT,
  `related_order_id` INT,
  `severity` ENUM('info', 'warning', 'critical') DEFAULT 'info',
  `is_read` BOOLEAN DEFAULT FALSE,
  `read_at` DATETIME,
  `role_target` ENUM('all', 'admin', 'staff', 'user') DEFAULT 'all',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `alert_type` (`alert_type`),
  KEY `is_read` (`is_read`),
  KEY `created_at` (`created_at`),
  KEY `role_target` (`role_target`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`related_product_id`) REFERENCES `cocolumber_logs`(`id`) ON DELETE SET NULL,
  CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`related_order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alert Rules
CREATE TABLE `alert_rules` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `rule_type` ENUM('LOW_STOCK', 'DRYING_DELAY', 'DAILY_SUMMARY') NOT NULL,
  `threshold_value` INT,
  `description` VARCHAR(255),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `rule_type` (`rule_type`),
  KEY `is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default alert rules
INSERT INTO `alert_rules` (`rule_type`, `threshold_value`, `description`) VALUES
('LOW_STOCK', 10, 'Alert when product stock falls below 10 units'),
('DRYING_DELAY', 1, 'Alert when drying process exceeds expected end date by 1 day'),
('DAILY_SUMMARY', 0, 'Send daily summary of all activities');

-- Drying Logs
CREATE TABLE `drying_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `batch_number` VARCHAR(100),
  `start_date` DATETIME NOT NULL,
  `expected_end_date` DATETIME NOT NULL,
  `actual_end_date` DATETIME,
  `status` ENUM('in_progress', 'completed', 'delayed') DEFAULT 'in_progress',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `status` (`status`),
  KEY `expected_end_date` (`expected_end_date`),
  CONSTRAINT `drying_logs_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `cocolumber_logs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification Preferences
CREATE TABLE `notification_preferences` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `LOW_STOCK_ENABLED` BOOLEAN DEFAULT TRUE,
  `DRYING_DELAY_ENABLED` BOOLEAN DEFAULT TRUE,
  `DAILY_SUMMARY_ENABLED` BOOLEAN DEFAULT TRUE,
  `ORDER_UPDATE_ENABLED` BOOLEAN DEFAULT TRUE,
  `summary_time` TIME DEFAULT '09:00:00',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `notif_pref_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- PAYMENT SYSTEM TABLES (PayMongo)
-- ==========================================

-- Payments
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `paymongo_payment_id` VARCHAR(255) UNIQUE,
  `paymongo_source_id` VARCHAR(255),
  `amount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('pending', 'chargeable', 'paid', 'failed', 'expired') DEFAULT 'pending',
  `payment_method` VARCHAR(50),
  `payment_reference` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `paid_at` TIMESTAMP NULL,
  `failed_at` TIMESTAMP NULL,
  `failure_reason` TEXT,
  `metadata` JSON,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_payment_status` (`status`),
  INDEX `idx_paymongo_id` (`paymongo_payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Logs
CREATE TABLE `payment_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payment_id` INT,
  `order_id` INT,
  `event_type` VARCHAR(100),
  `previous_status` VARCHAR(50),
  `new_status` VARCHAR(50),
  `details` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_event_type` (`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refunds
CREATE TABLE `refunds` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payment_id` INT NOT NULL,
  `order_id` INT NOT NULL,
  `paymongo_refund_id` VARCHAR(255),
  `amount` DECIMAL(10, 2) NOT NULL,
  `reason` TEXT,
  `status` ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  `requested_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL,
  FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- SHIPPING & TRACKING TABLES
-- ==========================================

-- Shipment Tracking
CREATE TABLE `shipment_tracking` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `notes` TEXT,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courier Updates
CREATE TABLE `courier_updates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `tracking_number` VARCHAR(100),
  `courier_name` VARCHAR(100),
  `location` VARCHAR(255),
  `update_message` TEXT,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_delivered` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_tracking` (`tracking_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- USEFUL VIEWS
-- ==========================================

-- Order Summary View
CREATE OR REPLACE VIEW `order_summary` AS
SELECT
  o.id,
  o.user_id,
  u.name as customer_name,
  u.email as customer_email,
  o.cocolumber_id,
  c.size as product_size,
  c.length as product_length,
  o.quantity,
  o.status,
  o.payment_status,
  o.order_notes,
  o.total_price,
  o.created_at as order_date,
  o.updated_at as last_updated
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN cocolumber_logs c ON o.cocolumber_id = c.id;

-- Order Status Summary View
CREATE OR REPLACE VIEW `order_status_summary` AS
SELECT
  status,
  COUNT(*) as order_count,
  SUM(quantity) as total_quantity
FROM orders
GROUP BY status;

-- Staff Store Summary View
CREATE OR REPLACE VIEW `staff_store_summary` AS
SELECT
  sp.staff_id,
  u.name as staff_name,
  u.email as staff_email,
  sp.store_name,
  COUNT(cl.id) as total_products,
  SUM(cl.stock) as total_stock,
  sp.is_active
FROM staff_profiles sp
JOIN users u ON sp.staff_id = u.id
LEFT JOIN cocolumber_logs cl ON cl.staff_id = sp.staff_id
GROUP BY sp.staff_id, u.name, u.email, sp.store_name, sp.is_active;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- ==========================================
-- SETUP COMPLETE
-- ==========================================
-- Database: cocolytics
-- Tables: 22 core tables + 3 views
-- Sample Data: Users, Products, Orders included
-- Features: Multi-seller, Chat, Notifications, Payments, Shipping
-- ==========================================
