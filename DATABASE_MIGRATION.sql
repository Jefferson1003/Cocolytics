-- Step 1: Add staff_id column to cocolumber_logs table
ALTER TABLE cocolumber_logs 
ADD COLUMN staff_id INT DEFAULT NULL,
ADD KEY idx_staff_id (staff_id),
ADD CONSTRAINT fk_cocolumber_staff FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL;

-- Step 2: Update existing products to assign to a default staff (optional)
-- Replace '1' with actual staff user ID
UPDATE cocolumber_logs SET staff_id = 1 WHERE staff_id IS NULL;

-- Step 3: Create staff_profiles table for additional seller info
CREATE TABLE IF NOT EXISTS staff_profiles (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  store_name VARCHAR(100) NOT NULL,
  store_description TEXT,
  store_logo VARCHAR(255),
  contact_number VARCHAR(20),
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_id (user_id),
  CONSTRAINT fk_staff_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 4: Insert sample staff profiles
INSERT INTO staff_profiles (user_id, store_name, store_description, is_active) 
SELECT id, CONCAT(name, "'s Store"), CONCAT('Quality coconut products from ', name), TRUE
FROM users WHERE role = 'staff';
