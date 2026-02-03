-- Cocolytics Database Schema for Order Management
-- Generated on February 1, 2026

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `cocolytics` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cocolytics`;

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS `order_history`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cocolumber_logs`;
DROP TABLE IF EXISTS `users`;

-- Users table (required for order management)
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','staff','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Coconut products table (required for orders)
CREATE TABLE IF NOT EXISTS `cocolumber_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `size` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `length` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `product_picture` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_size` (`size`),
  KEY `idx_stock` (`stock`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table (core of order management)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `cocolumber_id` int NOT NULL,
  `quantity` int NOT NULL CHECK (`quantity` > 0),
  `status` enum('pending','processing','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `order_notes` text COLLATE utf8mb4_unicode_ci,
  `total_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `cocolumber_id` (`cocolumber_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`cocolumber_id`) REFERENCES `cocolumber_logs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Paper uploads table (for admin approval)
CREATE TABLE IF NOT EXISTS `paper_uploads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `reviewed_by` int DEFAULT NULL,
  `review_note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `idx_status` (`status`),
  CONSTRAINT `paper_uploads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `paper_uploads_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order history table (for tracking status changes)
CREATE TABLE IF NOT EXISTS `order_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `old_status` enum('pending','processing','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` enum('pending','processing','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` int DEFAULT NULL,
  `change_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `order_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample users
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'BULILIT', 'jeffbala@gmail.com', '$2a$10$WXI7ZE.Z5Sx9Y3u0HhAWSumpZKcvjt3WxJrlLWSC2vge1kUh8g79a', 'user', '2026-01-20 14:18:26'),
(2, 'Admin User', 'admin@gmail.com', '$2a$10$Nlqid0N48er781AnPaF5w.6RBxezWdS.xRcky.GnL3Py3YiFhSd1K', 'admin', '2026-01-20 14:26:05'),
(3, 'Staff User', 'staff@gmail.com', '$2a$10$Nlqid0N48er781AnPaF5w.piZ3fdQzM3gF1gpwBTikNZWsOwKpH2S', 'staff', '2026-01-20 14:26:05'),
(4, 'Regular User', 'user@gmail.com', '$2a$10$Nlqid0N48er781AnPaF5w.Cu9T12zWFRK9RFoktQzTVEUkSpAGy3.', 'user', '2026-01-20 14:26:05');

-- Insert sample coconut products
INSERT IGNORE INTO `cocolumber_logs` (`id`, `size`, `length`, `stock`, `created_at`) VALUES
(1, 'Small', 15.50, 100, '2026-01-20 14:30:00'),
(2, 'Medium', 20.25, 75, '2026-01-20 14:30:00'),
(3, 'Large', 25.00, 50, '2026-01-20 14:30:00'),
(4, 'Extra Large', 30.75, 25, '2026-01-20 14:30:00');

-- Insert sample orders
INSERT IGNORE INTO `orders` (`id`, `user_id`, `cocolumber_id`, `quantity`, `status`, `order_notes`, `created_at`) VALUES
(1, 1, 2, 5, 'completed', 'Urgent delivery requested', '2026-01-20 15:00:00'),
(2, 4, 1, 10, 'pending', NULL, '2026-01-21 10:30:00'),
(3, 1, 3, 2, 'processing', 'Handle with care', '2026-01-21 14:15:00'),
(4, 4, 4, 1, 'cancelled', 'Customer changed mind', '2026-01-22 09:45:00');

-- Insert sample order history
INSERT IGNORE INTO `order_history` (`order_id`, `old_status`, `new_status`, `changed_by`, `change_reason`, `created_at`) VALUES
(1, NULL, 'pending', NULL, 'Order created', '2026-01-20 15:00:00'),
(1, 'pending', 'processing', 3, 'Order being prepared', '2026-01-20 16:00:00'),
(1, 'processing', 'completed', 3, 'Order delivered successfully', '2026-01-20 18:00:00'),
(2, NULL, 'pending', NULL, 'Order created', '2026-01-21 10:30:00'),
(3, NULL, 'pending', NULL, 'Order created', '2026-01-21 14:15:00'),
(3, 'pending', 'processing', 3, 'Started processing order', '2026-01-21 15:00:00'),
(4, NULL, 'pending', NULL, 'Order created', '2026-01-22 09:45:00'),
(4, 'pending', 'cancelled', 3, 'Customer requested cancellation', '2026-01-22 10:00:00');

-- Create useful views for order management
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
  o.order_notes,
  o.total_price,
  o.created_at as order_date,
  o.updated_at as last_updated
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN cocolumber_logs c ON o.cocolumber_id = c.id;

CREATE OR REPLACE VIEW `order_status_summary` AS
SELECT
  status,
  COUNT(*) as order_count,
  SUM(quantity) as total_quantity
FROM orders
GROUP BY status;

COMMIT;