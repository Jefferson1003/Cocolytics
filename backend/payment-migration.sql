-- Payment Tables for PayMongo Integration

-- Create payments table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `paymongo_payment_id` VARCHAR(255) UNIQUE,
  `paymongo_source_id` VARCHAR(255),
  `amount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('pending', 'chargeable', 'paid', 'failed', 'expired') DEFAULT 'pending',
  `payment_method` VARCHAR(50), -- 'gcash', 'grab_pay', 'paymaya', 'card'
  `payment_reference` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `paid_at` TIMESTAMP NULL,
  `failed_at` TIMESTAMP NULL,
  `failure_reason` TEXT,
  `metadata` JSON,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_user_id (user_id),
  INDEX idx_payment_status (status),
  INDEX idx_paymongo_id (paymongo_payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add columns to orders table for PayMongo integration
ALTER TABLE `orders` 
ADD COLUMN `payment_status` ENUM('not_paid', 'pending', 'paid') DEFAULT 'not_paid' AFTER `status`,
ADD COLUMN `paymongo_payment_id` VARCHAR(255) AFTER `payment_status`,
ADD COLUMN `total_amount` DECIMAL(10, 2) AFTER `paymongo_payment_id`,
ADD COLUMN `paid_at` TIMESTAMP NULL AFTER `total_amount`,
ADD INDEX idx_payment_status (payment_status);

-- Create payment logs table for audit trail
CREATE TABLE IF NOT EXISTS `payment_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payment_id` INT,
  `order_id` INT,
  `event_type` VARCHAR(100), -- 'initiated', 'successful', 'failed', 'refunded'
  `previous_status` VARCHAR(50),
  `new_status` VARCHAR(50),
  `details` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_event_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create refunds table
CREATE TABLE IF NOT EXISTS `refunds` (
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
  INDEX idx_order_id (order_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
