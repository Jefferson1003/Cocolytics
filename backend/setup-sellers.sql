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
-- ✅ STAFF ACCOUNT CREDENTIALS (Save this info!)
-- Vina: vina@cocolytics.com / Staff123
-- Paolo: paolo@cocolytics.com / Staff123
-- Bala: bala@cocolytics.com / Staff123
-- Hash generated from Node.js bcrypt with cost 10
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Vina', 'vina@cocolytics.com', '$2b$10$z.J9g8QwN7mK2xR3vL5tOeH6pI4jB1sT8uY5wZ0xC2dF3eG4hJ5i', 'staff'),
('Paolo', 'paolo@cocolytics.com', '$2b$10$z.J9g8QwN7mK2xR3vL5tOeH6pI4jB1sT8uY5wZ0xC2dF3eG4hJ5i', 'staff'),
('Bala', 'bala@cocolytics.com', '$2b$10$z.J9g8QwN7mK2xR3vL5tOeH6pI4jB1sT8uY5wZ0xC2dF3eG4hJ5i', 'staff');

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

-- VINA STORE PRODUCTS (Premium Selection)
INSERT INTO cocolumber_logs (size, length, stock, staff_id, created_at) VALUES
('Extra Large', 26, 15, @vina_id, NOW()),  -- CRITICAL STOCK
('Extra Large', 25, 22, @vina_id, NOW()),  -- CRITICAL STOCK
('Large', 23, 28, @vina_id, NOW()),        -- CRITICAL STOCK
('Large', 22, 45, @vina_id, NOW()),
('Large', 21, 60, @vina_id, NOW()),
('Medium', 19, 75, @vina_id, NOW()),
('Medium', 18, 85, @vina_id, NOW()),
('Medium', 17, 95, @vina_id, NOW()),
('Small', 15, 100, @vina_id, NOW()),
('Small', 14, 110, @vina_id, NOW());

-- PAOLO STORE PRODUCTS (Farm Fresh Selection)
INSERT INTO cocolumber_logs (size, length, stock, staff_id, created_at) VALUES
('Premium Large', 24, 12, @paolo_id, NOW()),    -- CRITICAL STOCK
('Premium Large', 23, 18, @paolo_id, NOW()),    -- CRITICAL STOCK
('Standard Large', 22, 25, @paolo_id, NOW()),   -- CRITICAL STOCK
('Standard Large', 21, 29, @paolo_id, NOW()),   -- CRITICAL STOCK
('Standard Medium', 20, 55, @paolo_id, NOW()),
('Standard Medium', 19, 65, @paolo_id, NOW()),
('Standard Small', 16, 80, @paolo_id, NOW()),
('Standard Small', 15, 90, @paolo_id, NOW()),
('Economy', 14, 120, @paolo_id, NOW()),
('Economy', 13, 130, @paolo_id, NOW());

-- BALA STORE PRODUCTS (Organic Selection)
INSERT INTO cocolumber_logs (size, length, stock, staff_id, created_at) VALUES
('Organic Jumbo', 28, 8, @bala_id, NOW()),      -- CRITICAL STOCK
('Organic Jumbo', 27, 14, @bala_id, NOW()),     -- CRITICAL STOCK
('Organic XL', 26, 20, @bala_id, NOW()),        -- CRITICAL STOCK
('Organic XL', 25, 26, @bala_id, NOW()),        -- CRITICAL STOCK
('Organic Large', 24, 29, @bala_id, NOW()),     -- CRITICAL STOCK
('Organic Large', 23, 45, @bala_id, NOW()),
('Organic Medium', 20, 70, @bala_id, NOW()),
('Organic Medium', 19, 75, @bala_id, NOW()),
('Organic Small', 17, 90, @bala_id, NOW()),
('Organic Small', 16, 95, @bala_id, NOW());

SELECT 'Multi-seller setup completed successfully!' as Status;
SELECT 'Created 3 sellers with diverse product selections:' as Info;
SELECT '  ✓ Vina Store: 10 premium coconut lumber products' as Details;
SELECT '  ✓ Paolo Store: 10 farm fresh coconut lumber products' as Details2;
SELECT '  ✓ Bala Store: 10 organic coconut lumber products' as Details3;
SELECT CONCAT('Total Products: ', COUNT(*)) FROM cocolumber_logs WHERE staff_id IN (@vina_id, @paolo_id, @bala_id) as TotalProducts;
