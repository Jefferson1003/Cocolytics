-- Multi-Seller Marketplace Setup
-- This script creates 3 staff sellers: Vina, Paolo, and Bala

-- Step 1: Add staff_id column to cocolumber_logs table if not exists
ALTER TABLE cocolumber_logs 
ADD COLUMN IF NOT EXISTS staff_id INT DEFAULT NULL;

-- Add index and foreign key if not exists
ALTER TABLE cocolumber_logs
ADD INDEX IF NOT EXISTS idx_staff_id (staff_id);

-- Step 2: Create staff_profiles table
CREATE TABLE IF NOT EXISTS staff_profiles (
  id INT NOT NULL AUTO_INCREMENT,
  staff_id INT NOT NULL,
  store_name VARCHAR(100) NOT NULL,
  store_description TEXT,
  store_logo VARCHAR(255),
  contact_number VARCHAR(20),
  store_address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_staff_id (staff_id),
  CONSTRAINT fk_staff_profile_user FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Create 3 staff users (Vina, Paolo, Bala)
-- Password for all: staff123 (hashed with bcrypt)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Vina', 'vina@cocolytics.com', '$2b$10$YourHashedPasswordHere', 'staff'),
('Paolo', 'paolo@cocolytics.com', '$2b$10$YourHashedPasswordHere', 'staff'),
('Bala', 'bala@cocolytics.com', '$2b$10$YourHashedPasswordHere', 'staff');

-- Step 4: Get the staff IDs (we'll use these below)
SET @vina_id = (SELECT id FROM users WHERE email = 'vina@cocolytics.com');
SET @paolo_id = (SELECT id FROM users WHERE email = 'paolo@cocolytics.com');
SET @bala_id = (SELECT id FROM users WHERE email = 'bala@cocolytics.com');

-- Step 5: Create store profiles for each seller
INSERT IGNORE INTO staff_profiles (staff_id, store_name, store_description, contact_number, is_active) VALUES
(@vina_id, 'Vina Store', 'Premium coconut products handpicked by Vina. Quality guaranteed!', '+63 917 123 4567', TRUE),
(@paolo_id, 'Paolo Store', 'Fresh coconuts directly from the farm. Paolo brings you the best!', '+63 918 234 5678', TRUE),
(@bala_id, 'Bala Store', 'Organic coconut selection by Bala. Healthy and delicious!', '+63 919 345 6789', TRUE);

-- Step 6: Create sample products for each seller
INSERT INTO cocolumber_logs (size, length, stock, staff_id, created_at) VALUES
-- Vina Store Products
('Extra Large', 25, 50, @vina_id, NOW()),
('Large', 22, 75, @vina_id, NOW()),
('Medium', 18, 100, @vina_id, NOW()),

-- Paolo Store Products
('Premium', 24, 60, @paolo_id, NOW()),
('Standard', 20, 80, @paolo_id, NOW()),
('Small', 15, 120, @paolo_id, NOW()),

-- Bala Store Products
('Jumbo', 28, 40, @bala_id, NOW()),
('Regular', 21, 90, @bala_id, NOW()),
('Mini', 16, 110, @bala_id, NOW());

SELECT 'Multi-seller setup completed successfully!' as Status;
SELECT 'Created 3 sellers: Vina Store, Paolo Store, Bala Store' as Info;
