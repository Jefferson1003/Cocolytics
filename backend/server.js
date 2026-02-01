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
