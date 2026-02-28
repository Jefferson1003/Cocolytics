-- Add shipping columns to orders table
ALTER TABLE `orders` 
ADD COLUMN `courier_name` VARCHAR(100) AFTER `status`,
ADD COLUMN `tracking_number` VARCHAR(100) AFTER `courier_name`,
ADD COLUMN `shipped_date` TIMESTAMP NULL AFTER `tracking_number`,
ADD COLUMN `delivered_date` TIMESTAMP NULL AFTER `shipped_date`,
MODIFY COLUMN `status` ENUM('pending','preparing_shipment','shipped','delivered','completed','cancelled') DEFAULT 'pending';

-- Create shipment tracking history table
CREATE TABLE IF NOT EXISTS `shipment_tracking` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `notes` TEXT,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create courier tracking updates table for real-time tracking
CREATE TABLE IF NOT EXISTS `courier_updates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `tracking_number` VARCHAR(100),
  `courier_name` VARCHAR(100),
  `location` VARCHAR(255),
  `update_message` TEXT,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_delivered` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_tracking (tracking_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
