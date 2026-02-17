const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'cocolytics-secret-key-2026';

// MySQL Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cocolytics',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// Ensure paper_uploads table exists
(async () => {
  try {
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS paper_uploads (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        file_path VARCHAR(255) NOT NULL,
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        reviewed_by INT DEFAULT NULL,
        review_note VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY reviewed_by (reviewed_by),
        KEY idx_status (status),
        CONSTRAINT paper_uploads_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT paper_uploads_ibfk_2 FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    );
    
    // Create stock_transactions table for tracking stock movements
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS stock_transactions (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        user_id INT DEFAULT NULL,
        transaction_type ENUM('stock_in','dispatch','adjust') NOT NULL,
        quantity INT NOT NULL,
        reason VARCHAR(255),
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY product_id (product_id),
        KEY user_id (user_id),
        KEY transaction_type (transaction_type),
        CONSTRAINT stock_trans_ibfk_1 FOREIGN KEY (product_id) REFERENCES cocolumber_logs(id) ON DELETE CASCADE,
        CONSTRAINT stock_trans_ibfk_2 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    );
    
    // Create warehouse_dispatches table for tracking products leaving warehouse
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS warehouse_dispatches (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        user_id INT DEFAULT NULL,
        quantity INT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        date_released DATETIME NOT NULL,
        notes TEXT,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY product_id (product_id),
        KEY user_id (user_id),
        KEY date_released (date_released),
        CONSTRAINT warehouse_disp_ibfk_1 FOREIGN KEY (product_id) REFERENCES cocolumber_logs(id) ON DELETE CASCADE,
        CONSTRAINT warehouse_disp_ibfk_2 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    );

    // Add staff_id column to orders table if it doesn't exist
    const [orderStaffCol] = await pool.execute(
      `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
       WHERE table_schema = DATABASE() AND table_name = 'orders' AND column_name = 'staff_id'`
    );
    if (orderStaffCol[0].count === 0) {
      await pool.execute('ALTER TABLE orders ADD COLUMN staff_id INT DEFAULT NULL');
    }

    // Add index for staff_id if it doesn't exist
    const [orderStaffIdx] = await pool.execute(
      `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.STATISTICS
       WHERE table_schema = DATABASE() AND table_name = 'orders' AND index_name = 'idx_staff_id'`
    );
    if (orderStaffIdx[0].count === 0) {
      await pool.execute('ALTER TABLE orders ADD INDEX idx_staff_id (staff_id)');
    }

    // Create staff_profiles table if it doesn't exist (uses staff_id)
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS staff_profiles (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    );

    // Migrate staff_profiles.user_id -> staff_id if needed
    const [staffIdCol] = await pool.execute(
      `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
       WHERE table_schema = DATABASE() AND table_name = 'staff_profiles' AND column_name = 'staff_id'`
    );
    if (staffIdCol[0].count === 0) {
      await pool.execute('ALTER TABLE staff_profiles ADD COLUMN staff_id INT NULL');
    }

    const [userIdCol] = await pool.execute(
      `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
       WHERE table_schema = DATABASE() AND table_name = 'staff_profiles' AND column_name = 'user_id'`
    );
    if (userIdCol[0].count > 0) {
      await pool.execute('UPDATE staff_profiles SET staff_id = user_id WHERE staff_id IS NULL');
    }

    const [staffProfileIdx] = await pool.execute(
      `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.STATISTICS
       WHERE table_schema = DATABASE() AND table_name = 'staff_profiles' AND index_name = 'unique_staff_id'`
    );
    if (staffProfileIdx[0].count === 0) {
      await pool.execute('ALTER TABLE staff_profiles ADD UNIQUE KEY unique_staff_id (staff_id)');
    }
  } catch (error) {
    console.error('❌ Failed to ensure tables:', error.message);
  }
})();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cocolumber-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept image files only
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
});

// Multer configuration for paper uploads (PDF/JPG/PNG)
const paperStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'paper-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const paperFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype.toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only PDF, JPG, and PNG files are allowed'));
};

const paperUpload = multer({
  storage: paperStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: paperFileFilter
});

// Serve uploaded files as static
app.use('/uploads', express.static(uploadsDir));

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Cocolytics API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ==================== AUTH ROUTES ====================

// Valid user roles
const VALID_ROLES = ['user', 'staff', 'admin'];

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate role (default to 'user' if not provided)
    const userRole = role && VALID_ROLES.includes(role) ? role : 'user';

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into database with role
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      user: { id: result.insertId, name, email, role: userRole }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user in database
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token with role
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role || 'user' }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Role-based authorization middleware
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

// Get current user (protected route)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== DATA ROUTES ====================

// Example API route (protected)
app.get('/api/data', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Item 1', value: 100 },
      { id: 2, name: 'Item 2', value: 200 },
      { id: 3, name: 'Item 3', value: 300 }
    ]
  });
});

// ==================== ADMIN ROUTES ====================

// Admin dashboard data (admin only)
app.get('/api/admin/dashboard', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    // Get user statistics
    const [userStats] = await pool.execute(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    
    const [totalUsers] = await pool.execute(
      'SELECT COUNT(*) as total FROM users'
    );

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers[0].total,
        usersByRole: userStats,
        adminFeatures: [
          'Manage Users',
          'View Reports',
          'System Settings',
          'Access Logs',
          'Production Reports',
          'Inventory Reports',
          'Dispatch Reports',
          'Yield & Wastage Analytics',
          'Forecast Reports',
          'System Logs'
        ]
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (admin only)
app.put('/api/admin/users/:id/role', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );

    res.json({ success: true, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== STAFF ROUTES ====================

// Staff dashboard data (staff and admin)
app.get('/api/staff/dashboard', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const [recentUsers] = await pool.execute(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    res.json({
      success: true,
      data: {
        recentUsers,
        staffFeatures: [
          'View Reports',
          'Manage Content',
          'Customer Support',
          'Data Entry'
        ]
      }
    });
  } catch (error) {
    console.error('Staff dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// AI Detection endpoint for cocolumber
app.post('/api/staff/detect-cocolumber', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ message: 'Image data required' });
    }
    
    // Call Python ML service
    const axios = require('axios');
    
    try {
      const mlResponse = await axios.post('http://localhost:5000/predict', {
        image: image
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      res.json(mlResponse.data);
    } catch (mlError) {
      console.error('ML Service error:', mlError.message);
      
      // Fallback to simulation if ML service is not running
      console.warn('ML service not available, using simulation...');
      const simulatedResult = simulateMLDetection();
      res.json(simulatedResult);
    }
    
  } catch (error) {
    console.error('Detection error:', error);
    res.status(500).json({ message: 'Detection failed', error: error.message });
  }
});

// Fallback simulation when ML service is unavailable
function simulateMLDetection() {
  const scenarios = [
    {
      detectedClass: 'cocolumber',
      height: (Math.random() * 10 + 8).toFixed(1),
      diameter: Math.floor(Math.random() * 30 + 35),
      estimatedLumber: Math.floor(Math.random() * 100 + 80),
      quality: ['Grade A', 'Grade B', 'Premium'][Math.floor(Math.random() * 3)],
      confidence: Math.floor(Math.random() * 15 + 85)
    },
    {
      detectedClass: 'human',
      confidence: 92
    },
    {
      detectedClass: 'car',
      confidence: 88
    }
  ];
  
  return scenarios[Math.floor(Math.random() * scenarios.length)];
}

// ==================== COCOLUMBER PRODUCT ROUTES ====================

// Add new cocolumber log (staff and admin only)
app.post('/api/staff/cocolumber', authenticateToken, authorizeRoles('staff', 'admin'), upload.single('product_picture'), async (req, res) => {
  try {
    const { size, length, stock } = req.body;

    // Validate input
    if (!size || !length || stock === undefined) {
      // Remove uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Size, length, and stock are required' });
    }

    // Prepare product picture path
    const productPicture = req.file ? `/uploads/${req.file.filename}` : null;

    // Insert into database with staff_id
    const [result] = await pool.execute(
      'INSERT INTO cocolumber_logs (size, length, stock, product_picture, staff_id) VALUES (?, ?, ?, ?, ?)',
      [size, length, stock, productPicture, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Cocolumber log added successfully',
      data: {
        id: result.insertId,
        size,
        length,
        stock,
        product_picture: productPicture
      }
    });
  } catch (error) {
    // Remove uploaded file if database insert fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Add cocolumber error:', error);
    res.status(500).json({ message: 'Server error while adding cocolumber log' });
  }
});

// Get all cocolumber logs (staff and admin only)
app.get('/api/staff/cocolumber', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    // Admins see all products, staff see only their own
    let query = 'SELECT * FROM cocolumber_logs';
    let params = [];
    
    if (req.user.role === 'staff') {
      query += ' WHERE staff_id = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [logs] = await pool.execute(query, params);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get cocolumber logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single cocolumber log (staff and admin only)
app.get('/api/staff/cocolumber/:id', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const [logs] = await pool.execute(
      'SELECT * FROM cocolumber_logs WHERE id = ?',
      [id]
    );

    if (logs.length === 0) {
      return res.status(404).json({ message: 'Cocolumber log not found' });
    }

    res.json({ success: true, data: logs[0] });
  } catch (error) {
    console.error('Get cocolumber log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cocolumber log (staff and admin only)
app.put('/api/staff/cocolumber/:id', authenticateToken, authorizeRoles('staff', 'admin'), upload.single('product_picture'), async (req, res) => {
  try {
    const { id } = req.params;
    const { size, length, stock } = req.body;

    // Get existing log
    const [existingLogs] = await pool.execute(
      'SELECT * FROM cocolumber_logs WHERE id = ?',
      [id]
    );

    if (existingLogs.length === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Cocolumber log not found' });
    }

    const existingLog = existingLogs[0];
    let productPicture = existingLog.product_picture;

    // If new file is uploaded, replace old one
    if (req.file) {
      if (existingLog.product_picture) {
        const oldFilePath = path.join(__dirname, existingLog.product_picture);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      productPicture = `/uploads/${req.file.filename}`;
    }

    // Update database
    await pool.execute(
      'UPDATE cocolumber_logs SET size = ?, length = ?, stock = ?, product_picture = ? WHERE id = ?',
      [size || existingLog.size, length || existingLog.length, stock !== undefined ? stock : existingLog.stock, productPicture, id]
    );

    res.json({
      success: true,
      message: 'Cocolumber log updated successfully',
      data: {
        id,
        size: size || existingLog.size,
        length: length || existingLog.length,
        stock: stock !== undefined ? stock : existingLog.stock,
        product_picture: productPicture
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Update cocolumber error:', error);
    res.status(500).json({ message: 'Server error while updating cocolumber log' });
  }
});

// Delete cocolumber log (staff and admin only)
app.delete('/api/staff/cocolumber/:id', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get log to delete associated file
    const [logs] = await pool.execute(
      'SELECT * FROM cocolumber_logs WHERE id = ?',
      [id]
    );

    if (logs.length === 0) {
      return res.status(404).json({ message: 'Cocolumber log not found' });
    }

    const log = logs[0];

    // Delete file if exists
    if (log.product_picture) {
      const filePath = path.join(__dirname, log.product_picture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from database
    await pool.execute(
      'DELETE FROM cocolumber_logs WHERE id = ?',
      [id]
    );

    res.json({ success: true, message: 'Cocolumber log deleted successfully' });
  } catch (error) {
    console.error('Delete cocolumber error:', error);
    res.status(500).json({ message: 'Server error while deleting cocolumber log' });
  }
});

// ==================== INVENTORY MANAGEMENT ROUTES ====================

// Update cocolumber stock only (for inventory management)
app.put('/api/cocolumber/:id', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock === null) {
      return res.status(400).json({ message: 'Stock quantity is required' });
    }

    // Check if cocolumber exists
    const [logs] = await pool.execute(
      'SELECT * FROM cocolumber_logs WHERE id = ?',
      [id]
    );

    if (logs.length === 0) {
      return res.status(404).json({ message: 'Cocolumber not found' });
    }

    // Update stock
    await pool.execute(
      'UPDATE cocolumber_logs SET stock = ? WHERE id = ?',
      [stock, id]
    );

    res.json({ success: true, message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Update cocolumber stock error:', error);
    res.status(500).json({ message: 'Server error while updating stock' });
  }
});

// Delete cocolumber (for inventory management)
app.delete('/api/cocolumber/:id', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get log to delete associated file
    const [logs] = await pool.execute(
      'SELECT * FROM cocolumber_logs WHERE id = ?',
      [id]
    );

    if (logs.length === 0) {
      return res.status(404).json({ message: 'Cocolumber not found' });
    }

    const log = logs[0];

    // Delete file if exists
    if (log.product_picture) {
      const filePath = path.join(__dirname, log.product_picture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from database
    await pool.execute(
      'DELETE FROM cocolumber_logs WHERE id = ?',
      [id]
    );

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete cocolumber error:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

// Stock-in (add stock to inventory)
app.post('/api/cocolumber/:id/stock-in', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // Check if product exists
    const [logs] = await pool.execute(
      'SELECT * FROM cocolumber_logs WHERE id = ?',
      [id]
    );

    if (logs.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update stock
    await pool.execute(
      'UPDATE cocolumber_logs SET stock = stock + ? WHERE id = ?',
      [quantity, id]
    );

    // Record transaction
    await pool.execute(
      'INSERT INTO stock_transactions (product_id, user_id, transaction_type, quantity, reason) VALUES (?, ?, ?, ?, ?)',
      [id, req.user.id, 'stock_in', quantity, reason || null]
    );

    res.json({ success: true, message: `Added ${quantity} units to stock`, newStock: logs[0].stock + quantity });
  } catch (error) {
    console.error('Stock-in error:', error);
    res.status(500).json({ message: 'Server error while adding stock' });
  }
});

// Dispatch (deduct stock from inventory)
app.post('/api/cocolumber/:id/dispatch', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // Check if product exists and has enough stock
    const [logs] = await pool.execute(
      'SELECT * FROM cocolumber_logs WHERE id = ?',
      [id]
    );

    if (logs.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = logs[0];

    if (product.stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}` });
    }

    // Update stock
    await pool.execute(
      'UPDATE cocolumber_logs SET stock = stock - ? WHERE id = ?',
      [quantity, id]
    );

    // Record transaction
    await pool.execute(
      'INSERT INTO stock_transactions (product_id, user_id, transaction_type, quantity, reason) VALUES (?, ?, ?, ?, ?)',
      [id, req.user.id, 'dispatch', quantity, reason || null]
    );

    res.json({ success: true, message: `Dispatched ${quantity} units`, newStock: product.stock - quantity });
  } catch (error) {
    console.error('Dispatch error:', error);
    res.status(500).json({ message: 'Server error while dispatching stock' });
  }
});

// Adjust stock (with reason)
app.post('/api/cocolumber/:id/adjust', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason } = req.body;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ message: 'Adjustment quantity is required' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Reason for adjustment is required' });
    }

    // Check if product exists
    const [logs] = await pool.execute(
      'SELECT * FROM cocolumber_logs WHERE id = ?',
      [id]
    );

    if (logs.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = logs[0];
    const newStock = product.stock + quantity;

    // Prevent negative stock
    if (newStock < 0) {
      return res.status(400).json({ message: `Adjustment would result in negative stock. Current: ${product.stock}, Adjustment: ${quantity}` });
    }

    // Update stock
    await pool.execute(
      'UPDATE cocolumber_logs SET stock = stock + ? WHERE id = ?',
      [quantity, id]
    );

    // Record transaction (use absolute value for display)
    await pool.execute(
      'INSERT INTO stock_transactions (product_id, user_id, transaction_type, quantity, reason) VALUES (?, ?, ?, ?, ?)',
      [id, req.user.id, 'adjust', Math.abs(quantity), reason]
    );

    res.json({ success: true, message: `Stock adjusted by ${quantity} units`, newStock });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ message: 'Server error while adjusting stock' });
  }
});

// Get stock transaction history for a product
app.get('/api/cocolumber/:id/transactions', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const [transactions] = await pool.execute(
      `SELECT 
        st.*,
        u.name as user_name,
        cl.size as product_size
       FROM stock_transactions st
       JOIN users u ON st.user_id = u.id
       JOIN cocolumber_logs cl ON st.product_id = cl.id
       WHERE st.product_id = ?
       ORDER BY st.created_at DESC
       LIMIT 50`,
      [id]
    );

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error while fetching transactions' });
  }
});

// ==================== WAREHOUSE DISPATCH ROUTES ====================

// Create warehouse dispatch (auto-deduct inventory)
app.post('/api/warehouse/dispatch', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const { product_id, quantity, customer_name, date_released, notes } = req.body;

    if (!product_id || !quantity || !customer_name || !date_released) {
      return res.status(400).json({ message: 'Product, quantity, customer name, and date are required' });
    }

    // Check if product exists and has enough stock
    const [products] = await pool.execute(
      'SELECT * FROM cocolumber_logs WHERE id = ?',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = products[0];

    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}` 
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Deduct from inventory
      await connection.execute(
        'UPDATE cocolumber_logs SET stock = stock - ? WHERE id = ?',
        [quantity, product_id]
      );

      // 2. Record dispatch
      const [dispatchResult] = await connection.execute(
        `INSERT INTO warehouse_dispatches 
         (product_id, user_id, quantity, customer_name, date_released, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product_id, req.user.id, quantity, customer_name, date_released, notes || null]
      );

      // 3. Record stock transaction
      await connection.execute(
        `INSERT INTO stock_transactions 
         (product_id, user_id, transaction_type, quantity, reason) 
         VALUES (?, ?, 'dispatch', ?, ?)`,
        [product_id, req.user.id, quantity, `Warehouse dispatch to ${customer_name}`]
      );

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: 'Dispatch recorded and inventory updated',
        dispatch_id: dispatchResult.insertId,
        new_stock: product.stock - quantity
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Warehouse dispatch error:', error);
    res.status(500).json({ message: 'Server error while processing dispatch' });
  }
});

// Get all warehouse dispatches
app.get('/api/warehouse/dispatches', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const [dispatches] = await pool.execute(
      `SELECT 
        wd.*,
        cl.size as product_size,
        cl.length as product_length,
        u.name as user_name
       FROM warehouse_dispatches wd
       JOIN cocolumber_logs cl ON wd.product_id = cl.id
       LEFT JOIN users u ON wd.user_id = u.id
       ORDER BY wd.date_released DESC, wd.created_at DESC
       LIMIT 100`
    );
    res.json(dispatches);
  } catch (error) {
    console.error('Get dispatches error:', error);
    res.status(500).json({ message: 'Server error while fetching dispatches' });
  }
});

// ==================== PAPER UPLOAD ROUTES ====================

// Create paper upload (staff/admin)
app.post('/api/papers', authenticateToken, authorizeRoles('staff', 'admin'), paperUpload.single('paper'), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !req.file) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Title and file are required' });
    }

    const filePath = `/uploads/${req.file.filename}`;

    const [result] = await pool.execute(
      'INSERT INTO paper_uploads (user_id, title, description, file_path, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, description || null, filePath, 'pending']
    );

    res.json({
      id: result.insertId,
      user_id: req.user.id,
      title,
      description: description || null,
      file_path: filePath,
      status: 'pending'
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Paper upload error:', error);
    res.status(500).json({ message: 'Server error while uploading paper', error: error.message });
  }
});

// Get current user's uploads (staff/admin)
app.get('/api/papers/mine', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM paper_uploads WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Fetch papers error:', error);
    res.status(500).json({ message: 'Server error while fetching papers' });
  }
});

// Get pending uploads for admin
app.get('/api/papers/pending', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, u.name AS uploader_name, u.email AS uploader_email
       FROM paper_uploads p
       JOIN users u ON p.user_id = u.id
       WHERE p.status = 'pending'
       ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Fetch pending papers error:', error);
    res.status(500).json({ message: 'Server error while fetching pending papers' });
  }
});

// Approve paper (admin)
app.put('/api/papers/:id/approve', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNote } = req.body;

    const [result] = await pool.execute(
      'UPDATE paper_uploads SET status = ?, reviewed_by = ?, review_note = ? WHERE id = ?',
      ['approved', req.user.id, reviewNote || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    res.json({ success: true, message: 'Paper approved' });
  } catch (error) {
    console.error('Approve paper error:', error);
    res.status(500).json({ message: 'Server error while approving paper' });
  }
});

// Reject paper (admin)
app.put('/api/papers/:id/reject', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNote } = req.body;

    const [result] = await pool.execute(
      'UPDATE paper_uploads SET status = ?, reviewed_by = ?, review_note = ? WHERE id = ?',
      ['rejected', req.user.id, reviewNote || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    res.json({ success: true, message: 'Paper rejected' });
  } catch (error) {
    console.error('Reject paper error:', error);
    res.status(500).json({ message: 'Server error while rejecting paper' });
  }
});

// ==================== USER ORDER ROUTES ====================

// Get all available cocolumber products (all authenticated users)
app.get('/api/cocolumber/all', authenticateToken, async (req, res) => {
  try {
    const [products] = await pool.execute(
      'SELECT * FROM cocolumber_logs WHERE stock > 0 ORDER BY created_at DESC'
    );
    res.json(products);
  } catch (error) {
    console.error('Get all cocolumbers error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// Get all cocolumber for inventory management (includes zero stock)
app.get('/api/cocolumber/inventory', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    // Admins see all products, staff see only their own
    let query = 'SELECT * FROM cocolumber_logs';
    let params = [];
    
    if (req.user.role === 'staff') {
      query += ' WHERE staff_id = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [products] = await pool.execute(query, params);
    res.json(products);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error fetching inventory' });
  }
});

// ==================== STAFF STORES ROUTES ====================

// Get all staff stores with their products (for users to browse)
app.get('/api/staff-stores', async (req, res) => {
  try {
    const [staffStores] = await pool.execute(
      `SELECT 
        u.id as staff_id,
        u.name as staff_name,
        u.email,
        sp.store_name,
        sp.store_description,
        sp.store_logo,
        sp.contact_number,
        sp.store_address,
        sp.is_active,
        COUNT(DISTINCT cl.id) as product_count,
        COALESCE(SUM(cl.stock), 0) as total_stock
       FROM users u
      LEFT JOIN staff_profiles sp ON u.id = sp.staff_id
       LEFT JOIN cocolumber_logs cl ON u.id = cl.staff_id AND cl.stock > 0
       WHERE u.role = 'staff' AND (sp.is_active = TRUE OR sp.is_active IS NULL)
       GROUP BY u.id, sp.id
       HAVING product_count > 0 OR total_stock > 0
       ORDER BY sp.store_name ASC`
    );

    res.json(staffStores);
  } catch (error) {
    console.error('Get staff stores error:', error);
    res.status(500).json({ message: 'Server error fetching staff stores' });
  }
});

// Get products from a specific staff store
app.get('/api/staff-stores/:staffId/products', async (req, res) => {
  try {
    const { staffId } = req.params;

    const [products] = await pool.execute(
      `SELECT 
        cl.*,
        u.name as staff_name,
        u.id as staff_id,
        sp.store_name,
        sp.store_logo,
        sp.store_description,
        sp.store_address,
        sp.contact_number,
        sp.is_active
       FROM cocolumber_logs cl
       JOIN users u ON cl.staff_id = u.id
      LEFT JOIN staff_profiles sp ON u.id = sp.staff_id
       WHERE cl.staff_id = ? AND cl.stock > 0
       ORDER BY cl.created_at DESC`,
      [staffId]
    );

    if (products.length === 0) {
      return res.json({
        store_info: {
          staff_id: staffId,
          store_name: '',
          store_logo: null,
          store_description: '',
          store_address: '',
          contact_number: '',
          is_active: false
        },
        products: []
      });
    }

    res.json({
      store_info: {
        staff_id: products[0].staff_id,
        staff_name: products[0].staff_name,
        store_name: products[0].store_name,
        store_logo: products[0].store_logo,
        store_description: products[0].store_description,
        store_address: products[0].store_address,
        contact_number: products[0].contact_number,
        is_active: products[0].is_active,
        product_count: products.length,
        total_stock: products.reduce((sum, p) => sum + p.stock, 0)
      },
      products: products
    });
  } catch (error) {
    console.error('Get staff store products error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// Get staff store details
app.get('/api/staff-stores/:staffId', async (req, res) => {
  try {
    const { staffId } = req.params;

    const [storeDetails] = await pool.execute(
      `SELECT 
        u.id as staff_id,
        u.name as staff_name,
        u.email,
        sp.store_name,
        sp.store_description,
        sp.store_logo,
        sp.contact_number,
        sp.store_address,
        sp.is_active,
        COUNT(DISTINCT cl.id) as product_count,
        COALESCE(SUM(cl.stock), 0) as total_stock
       FROM users u
      LEFT JOIN staff_profiles sp ON u.id = sp.staff_id
       LEFT JOIN cocolumber_logs cl ON u.id = cl.staff_id AND cl.stock > 0
       WHERE u.id = ? AND u.role = 'staff'
       GROUP BY u.id, sp.id`,
      [staffId]
    );

    if (storeDetails.length === 0) {
      return res.status(404).json({ message: 'Staff store not found' });
    }

    res.json(storeDetails[0]);
  } catch (error) {
    console.error('Get staff store error:', error);
    res.status(500).json({ message: 'Server error fetching store details' });
  }
});

// ==================== ORDERS ROUTES ====================

// Create order (all authenticated users)
app.post('/api/orders/create', authenticateToken, async (req, res) => {
  try {
    const { items, staffId } = req.body;
    const userId = req.user.id;

    console.log('Creating order for user:', userId);
    console.log('Order items:', JSON.stringify(items, null, 2));

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Validate items have required fields
    for (const item of items) {
      if (!item.id || !item.quantity) {
        return res.status(400).json({ 
          message: 'Each item must have an id and quantity',
          invalidItem: item
        });
      }
    }

    // Check if orders.staff_id exists (for backward compatibility)
    const [ordersStaffCol] = await pool.execute(
      `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
       WHERE table_schema = DATABASE() AND table_name = 'orders' AND column_name = 'staff_id'`
    );
    const hasStaffIdColumn = ordersStaffCol[0].count > 0;

    // Insert each order item
    const orderIds = [];
    for (const item of items) {
      // Check if product exists and has enough stock
      const [products] = await pool.execute(
        'SELECT * FROM cocolumber_logs WHERE id = ?',
        [item.id]
      );

      if (products.length === 0) {
        return res.status(400).json({ 
          message: `Product with ID ${item.id} not found` 
        });
      }

      const product = products[0];
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.size}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      // Insert order (include staff_id only if column exists)
      let result;
      if (hasStaffIdColumn) {
        [result] = await pool.execute(
          'INSERT INTO orders (user_id, cocolumber_id, quantity, status, staff_id) VALUES (?, ?, ?, ?, ?)',
          [userId, item.id, item.quantity, 'pending', product.staff_id || null]
        );
      } else {
        [result] = await pool.execute(
          'INSERT INTO orders (user_id, cocolumber_id, quantity, status) VALUES (?, ?, ?, ?)',
          [userId, item.id, item.quantity, 'pending']
        );
      }
      orderIds.push(result.insertId);

      // Update stock (reduce by quantity ordered)
      await pool.execute(
        'UPDATE cocolumber_logs SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.id]
      );
      
      console.log(`Order created: ID ${result.insertId}, Product: ${product.size}, Quantity: ${item.quantity}`);
    }

    console.log('All orders created successfully:', orderIds);

    res.json({
      success: true,
      message: 'Order created successfully',
      orderIds
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      message: 'Server error creating order',
      error: error.message 
    });
  }
});

// Get user's orders
app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Fetching orders for user:', userId);

    const [orders] = await pool.execute(
      `SELECT 
        o.*,
        c.size, c.length, c.stock, c.product_picture,
        u.name as staff_name,
        sp.store_name, sp.store_logo, sp.contact_number
       FROM orders o
       JOIN cocolumber_logs c ON o.cocolumber_id = c.id
       LEFT JOIN users u ON o.staff_id = u.id
      LEFT JOIN staff_profiles sp ON o.staff_id = sp.staff_id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    console.log(`Found ${orders.length} orders for user ${userId}`);

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ 
      message: 'Server error fetching orders',
      error: error.message 
    });
  }
});

// Get all orders (staff and admin)
app.get('/api/orders/all', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    let query = `SELECT 
        o.*,
        u.name as user_name, u.email,
        c.size, c.length, c.product_picture,
        staff_u.name as staff_name,
        sp.store_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN cocolumber_logs c ON o.cocolumber_id = c.id
       LEFT JOIN users staff_u ON o.staff_id = staff_u.id
      LEFT JOIN staff_profiles sp ON o.staff_id = sp.staff_id`;

    const params = [];
    if (req.user.role === 'staff') {
      query += ' WHERE o.staff_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await pool.execute(query, params);

    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Update order status (staff and admin)
app.put('/api/orders/:id/status', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    let updateQuery = 'UPDATE orders SET status = ? WHERE id = ?';
    const params = [status, id];

    if (req.user.role === 'staff') {
      updateQuery += ' AND staff_id = ?';
      params.push(req.user.id);
    }

    const [result] = await pool.execute(updateQuery, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found or not authorized' });
    }

    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order' });
  }
});

// ==================== MULTI-SELLER MARKETPLACE ROUTES ====================

// Get all sellers with their product counts
app.get('/api/sellers', async (req, res) => {
  try {
    const [sellers] = await pool.query(`
      SELECT 
        u.id as staff_id,
        u.name as staff_name,
        sp.store_name,
        sp.store_description,
        sp.store_logo,
        sp.contact_number,
        sp.is_active,
        COUNT(cl.id) as product_count,
        SUM(cl.stock) as total_stock
      FROM users u
      LEFT JOIN staff_profiles sp ON u.id = sp.staff_id
      LEFT JOIN cocolumber_logs cl ON u.id = cl.staff_id
      WHERE u.role = 'staff' AND (sp.is_active IS NULL OR sp.is_active = 1)
      GROUP BY u.id
      HAVING product_count > 0
      ORDER BY product_count DESC
    `);
    res.json(sellers);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ message: 'Error fetching sellers' });
  }
});

// Get products by specific seller
app.get('/api/sellers/:staffId/products', async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT 
        cl.*,
        u.name as staff_name,
        sp.store_name,
        sp.store_logo,
        sp.contact_number
      FROM cocolumber_logs cl
      JOIN users u ON cl.staff_id = u.id
      LEFT JOIN staff_profiles sp ON u.id = sp.staff_id
      WHERE cl.staff_id = ? AND cl.stock > 0
      ORDER BY cl.created_at DESC
    `, [req.params.staffId]);
    res.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get staff profile
app.get('/api/staff/profile', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const [profile] = await pool.query(`
      SELECT sp.*, u.name as staff_name FROM staff_profiles sp
      JOIN users u ON sp.staff_id = u.id
      WHERE sp.staff_id = ?
    `, [req.user.id]);
    
    if (profile.length === 0) {
      // Return default profile if not exists
      const [user] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
      return res.json({
        staff_name: user[0]?.name || 'Staff',
        store_name: user[0]?.name + "'s Store" || 'My Store',
        store_description: '',
        store_logo: null,
        contact_number: '',
        store_address: '',
        is_active: true
      });
    }
    
    res.json(profile[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update staff profile with multer for logo upload
app.put('/api/staff/profile', authenticateToken, authorizeRoles('staff', 'admin'), upload.single('store_logo'), async (req, res) => {
  try {
    const { store_name, store_description, contact_number, store_address, is_active } = req.body;
    const store_logo = req.file ? `/uploads/${req.file.filename}` : null;

    // Check if profile exists
    const [existing] = await pool.query(
      'SELECT * FROM staff_profiles WHERE staff_id = ?',
      [req.user.id]
    );

    if (existing.length === 0) {
      // Insert new profile
      await pool.query(`
        INSERT INTO staff_profiles 
        (staff_id, store_name, store_description, store_logo, contact_number, store_address, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [req.user.id, store_name, store_description, store_logo, contact_number, store_address, is_active]);
    } else {
      // Update existing profile
      const updateFields = {
        store_name,
        store_description,
        contact_number,
        store_address,
        is_active
      };
      
      if (store_logo) {
        updateFields.store_logo = store_logo;
      }

      const updateQuery = `
        UPDATE staff_profiles 
        SET ${Object.keys(updateFields).map(key => `${key} = ?`).join(', ')}
        WHERE staff_id = ?
      `;
      
      await pool.query(updateQuery, [...Object.values(updateFields), req.user.id]);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// ==================== STAFF REPORTS ROUTES ====================

// Get staff sales reports with monthly/yearly breakdown
app.get('/api/staff/reports', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const staffId = req.user.role === 'admin' ? req.query.staffId || req.user.id : req.user.id;
    const period = req.query.period || 'month'; // month, quarter, year, all

    // Get sales by month
    const [monthlySales] = await pool.execute(`
      SELECT 
        DATE_FORMAT(o.created_at, '%Y-%m') as month,
        COUNT(o.id) as total_orders,
        SUM(o.quantity) as total_items,
        ROUND(SUM(o.total_price), 2) as revenue
      FROM orders o
      WHERE o.staff_id = ?
      GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, [staffId]);

    // Get sales by year
    const [yearlySales] = await pool.execute(`
      SELECT 
        YEAR(o.created_at) as year,
        COUNT(o.id) as total_orders,
        SUM(o.quantity) as total_items,
        ROUND(SUM(o.total_price), 2) as revenue
      FROM orders o
      WHERE o.staff_id = ?
      GROUP BY YEAR(o.created_at)
      ORDER BY year DESC
    `, [staffId]);

    // Get total stats
    const [totalStats] = await pool.execute(`
      SELECT 
        COUNT(o.id) as total_orders,
        SUM(o.quantity) as total_items,
        ROUND(SUM(o.total_price), 2) as total_revenue,
        ROUND(AVG(o.rating), 1) as avg_rating
      FROM orders o
      WHERE o.staff_id = ?
    `, [staffId]);

    // Get this month stats
    const [thisMonthStats] = await pool.execute(`
      SELECT 
        COUNT(o.id) as total_orders,
        SUM(o.quantity) as total_items,
        ROUND(SUM(o.total_price), 2) as revenue
      FROM orders o
      WHERE o.staff_id = ? AND DATE_FORMAT(o.created_at, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
    `, [staffId]);

    // Get last month stats for growth calculation
    const [lastMonthStats] = await pool.execute(`
      SELECT 
        ROUND(SUM(o.total_price), 2) as revenue
      FROM orders o
      WHERE o.staff_id = ? AND DATE_FORMAT(o.created_at, '%Y-%m') = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m')
    `, [staffId]);

    // Get top products by cocolumber grade - use cocolumber_logs staff_id to match
    const [topProducts] = await pool.execute(`
      SELECT 
        c.size as grade,
        COUNT(o.id) as times_sold,
        SUM(o.quantity) as total_quantity
      FROM orders o
      JOIN cocolumber_logs c ON o.cocolumber_id = c.id
      WHERE o.staff_id = ?
      GROUP BY c.size
      ORDER BY total_quantity DESC
      LIMIT 5
    `, [staffId]);

    // Calculate growth percentage
    const thisMonthRevenue = thisMonthStats[0]?.revenue || 0;
    const lastMonthRevenue = lastMonthStats[0]?.revenue || 0;
    const growthPercentage = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    res.json({
      totalStats: totalStats[0] || {},
      monthlySales: monthlySales || [],
      yearlySales: yearlySales || [],
      thisMonthStats: thisMonthStats[0] || {},
      lastMonthRevenue: lastMonthRevenue,
      growthPercentage,
      topProducts: topProducts || []
    });
  } catch (error) {
    console.error('Staff reports error:', error);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
