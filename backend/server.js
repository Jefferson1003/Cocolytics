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
          'View Analytics',
          'System Settings',
          'Access Logs'
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

    // Insert into database
    const [result] = await pool.execute(
      'INSERT INTO cocolumber_logs (size, length, stock, product_picture) VALUES (?, ?, ?, ?)',
      [size, length, stock, productPicture]
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
    const [logs] = await pool.execute(
      'SELECT * FROM cocolumber_logs ORDER BY created_at DESC'
    );
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
    const [products] = await pool.execute(
      'SELECT * FROM cocolumber_logs ORDER BY created_at DESC'
    );
    res.json(products);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error fetching inventory' });
  }
});

// Create order (all authenticated users)
app.post('/api/orders/create', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Insert each order item
    const orderIds = [];
    for (const item of items) {
      const [result] = await pool.execute(
        'INSERT INTO orders (user_id, cocolumber_id, quantity, status) VALUES (?, ?, ?, ?)',
        [userId, item.id, item.quantity, 'pending']
      );
      orderIds.push(result.insertId);

      // Update stock (reduce by quantity ordered)
      await pool.execute(
        'UPDATE cocolumber_logs SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.id]
      );
    }

    res.json({
      success: true,
      message: 'Order created successfully',
      orderIds
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// Get user's orders
app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders] = await pool.execute(
      `SELECT o.*, c.size, c.length, c.stock, c.product_picture
       FROM orders o
       JOIN cocolumber_logs c ON o.cocolumber_id = c.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Get all orders (staff and admin)
app.get('/api/orders/all', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.*, u.name as user_name, u.email, c.size, c.length, c.product_picture
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN cocolumber_logs c ON o.cocolumber_id = c.id
       ORDER BY o.created_at DESC`
    );

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

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order' });
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
