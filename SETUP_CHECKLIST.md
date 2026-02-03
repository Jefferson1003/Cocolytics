# Cocolytics Project - Setup & Implementation Checklist

**Generated:** February 3, 2026  
**Project:** Cocolytics - Coconut Lumber Inventory Management System

---

## ✅ IMPLEMENTATION STATUS

### 3.2 Setup Development Environment
**Status:** ✅ **COMPLETE**

**Implemented:**
- Backend: Node.js + Express.js server running on port 3000
- Frontend: Vue 3 + Vite development server running on port 5173
- Database: MySQL 8.4.3 with connection pooling
- Package Management: npm with all dependencies installed

**Files:**
- Backend dependencies: [backend/package.json](backend/package.json)
  - express, bcryptjs, jsonwebtoken, mysql2, cors, multer, dotenv
- Frontend dependencies: [frontend/package.json](frontend/package.json)
  - vue, vue-router, axios, vite, chart.js

**Start Commands:**
```bash
# Backend
cd backend && npm start

# Frontend  
cd frontend && npm run dev
```

---

### 3.3 Setup Database
**Status:** ✅ **COMPLETE**

**Implemented:**
- MySQL database "cocolytics" created and connected
- Connection pooling configured with 10 max connections
- Auto-connection testing on server startup
- Automatic table creation on startup

**Configuration:** [backend/server.js](backend/server.js) (Lines 16-33)
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cocolytics',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

**Database Files:**
- [backend/cocolytics.sql](backend/cocolytics.sql) - Database schema dump
- [backend/database.sql](backend/database.sql) - Alternative database schema

---

### 3.4 Create User & Role Tables
**Status:** ✅ **COMPLETE**

**Users Table Created:** [backend/cocolytics.sql](backend/cocolytics.sql) (Lines 30-41)
```sql
CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` enum('user','staff','admin') DEFAULT 'user',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Valid Roles Defined:** [backend/server.js](backend/server.js) (Line 205)
```javascript
const VALID_ROLES = ['user', 'staff', 'admin'];
```

**Sample Users Provided:**
| ID | Name | Email | Role | Password |
|---|---|---|---|---|
| 1 | BULILIT | jeffbala@gmail.com | user | hashed |
| 2 | Admin User | admin@gmail.com | admin | hashed |
| 3 | Staff User | staff@gmail.com | staff | hashed |
| 4 | Regular User | user@gmail.com | user | hashed |

**Related Tables Created:**
- `cocolumber_logs` - Products table
- `orders` - User orders
- `paper_uploads` - Document uploads

---

### 3.5 Develop Login/Logout
**Status:** ✅ **COMPLETE**

#### Login Implementation
**Frontend:** [frontend/src/views/Login.vue](frontend/src/views/Login.vue)

**Features:**
- Email and password input fields
- Password visibility toggle
- Error message display
- Loading state during submission
- Automatic redirection based on user role (admin → /admin, staff → /staff, user → /)
- Token & user data stored in localStorage

**Backend Endpoint:** [backend/server.js](backend/server.js) (Lines 251-295)
```javascript
app.post('/api/auth/login', async (req, res) => {
  // Validates email and password
  // Compares password with hashed value
  // Returns JWT token valid for 24 hours
  // Includes user role in response
})
```

#### Logout Implementation
**Frontend:** [frontend/src/components/AdminSidebar.vue](frontend/src/components/AdminSidebar.vue) (Lines 67-77)

**Features:**
- Logout button in navigation sidebar
- Confirmation modal before logout
- Clears localStorage (token and user data)
- Redirects to login page

**Implementation:**
```javascript
confirmLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  this.$router.push('/login')
}
```

**Also Implemented In:**
- [frontend/src/components/StaffSidebar.vue](frontend/src/components/StaffSidebar.vue)
- [frontend/src/components/UserNavbar.vue](frontend/src/components/UserNavbar.vue)

---

### 3.6 Implement Password Encryption
**Status:** ✅ **COMPLETE**

**Library Used:** bcryptjs v2.4.3

**Password Hashing:** [backend/server.js](backend/server.js) (Lines 231-232)
```javascript
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```

**Password Verification:** [backend/server.js](backend/server.js) (Line 273)
```javascript
const isMatch = await bcrypt.compare(password, user.password);
```

**JWT Token Encryption:** [backend/server.js](backend/server.js) (Lines 279-284)
```javascript
const token = jwt.sign(
  { id: user.id, email: user.email, name: user.name, role: user.role },
  JWT_SECRET,
  { expiresIn: '24h' }
);
```

**JWT Secret:** Configured in environment variables
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'cocolytics-secret-key-2026';
```

---

### 3.7 Apply Role-Based Access Control
**Status:** ✅ **COMPLETE**

#### Backend RBAC Implementation

**Authentication Middleware:** [backend/server.js](backend/server.js) (Lines 176-191)
```javascript
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
```

**Authorization Middleware:** [backend/server.js](backend/server.js) (Lines 300-306)
```javascript
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};
```

**Protected Routes:**

| Endpoint | Method | Roles | Purpose |
|----------|--------|-------|---------|
| `/api/auth/register` | POST | public | User registration |
| `/api/auth/login` | POST | public | User login |
| `/api/auth/me` | GET | authenticated | Get current user |
| `/api/admin/dashboard` | GET | admin | Admin dashboard stats |
| `/api/admin/users` | GET | admin | List all users |
| `/api/admin/users/:id/role` | PUT | admin | Change user role |
| `/api/staff/dashboard` | GET | staff, admin | Staff dashboard |
| `/api/cocolumber` | GET | authenticated | Get products |
| `/api/orders` | GET | authenticated | Get user orders |

#### Frontend RBAC Implementation

**Route Guards:** [frontend/src/main.js](frontend/src/main.js) (Lines 127-170)

**Route Meta Configuration:**
```javascript
const routes = [
  { path: '/admin', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/staff', meta: { requiresAuth: true, roles: ['staff', 'admin'] } },
  { path: '/login', meta: { guest: true } },
]
```

**Navigation Guard Logic:**
```javascript
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  
  // Check authentication requirement
  if (to.meta.requiresAuth && !token) {
    next('/login')
  }
  // Check role authorization
  else if (to.meta.roles && !to.meta.roles.includes(user?.role)) {
    // Redirect to appropriate dashboard
  }
})
```

**Protected Views:**
| Route | Component | Allowed Roles |
|-------|-----------|---------------|
| `/` | Home | authenticated |
| `/admin` | AdminDashboard | admin |
| `/staff` | WarehouseDispatch | staff, admin |
| `/staff/inventory` | StaffInventory | staff, admin |
| `/orders` | UserOrders | user, staff, admin |

---

## 📊 SUMMARY TABLE

| Item | Status | Implementation |
|------|--------|-----------------|
| Development Environment | ✅ | Node.js, Vue 3, Vite, MySQL |
| Database Setup | ✅ | MySQL with pooling & auto-table creation |
| User & Role Tables | ✅ | `users` table with 3 roles (user, staff, admin) |
| Register Endpoint | ✅ | `/api/auth/register` with validation |
| Login Endpoint | ✅ | `/api/auth/login` with JWT token |
| Logout Feature | ✅ | Frontend logout with localStorage cleanup |
| Password Encryption | ✅ | bcryptjs with salt rounds = 10 |
| JWT Token Support | ✅ | 24-hour expiration, role included |
| Backend RBAC | ✅ | `authenticateToken` & `authorizeRoles` middleware |
| Frontend RBAC | ✅ | Route guards with role checking |
| Admin Access Control | ✅ | Admin-only routes protected |
| Staff Access Control | ✅ | Staff-only routes protected |
| User Access Control | ✅ | Regular user access to public routes |

---

## 🔐 Security Features Implemented

1. **Password Security:**
   - bcryptjs hashing with salt (cost factor: 10)
   - Never stored in plaintext
   - Compared securely during login

2. **Token Security:**
   - JWT with HS256 algorithm
   - 24-hour expiration
   - Verified on protected routes
   - Bearer token format in Authorization header

3. **Access Control:**
   - Multi-layer authentication (frontend + backend)
   - Role-based authorization on all sensitive endpoints
   - Request validation before database queries
   - Error messages don't leak user information

4. **CORS Protection:**
   - CORS enabled for development
   - Cross-origin requests validated

---

## 🚀 Getting Started

### 1. Database Setup
```bash
# Import the database schema
mysql -u root < backend/cocolytics.sql
```

### 2. Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 3. Environment Configuration
Create `.env` file in backend directory:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cocolytics
JWT_SECRET=your-secret-key-here
PORT=3000
```

### 4. Start Servers
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 5. Test Login
- Admin: admin@gmail.com / password
- Staff: staff@gmail.com / password  
- User: user@gmail.com / password

---

## 📝 Notes

- All passwords in sample data are hashed with bcryptjs
- JWT tokens expire after 24 hours
- User roles determine accessible routes and API endpoints
- Frontend redirects unauthenticated users to `/login`
- Logout clears all session data from localStorage
- Role-based access is enforced on both client and server sides

