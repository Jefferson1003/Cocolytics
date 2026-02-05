# Multi-Seller Marketplace Implementation Guide

## ✅ What Has Been Created

### 1. Database Migration
**File:** `DATABASE_MIGRATION.sql`
- Adds `staff_id` to `cocolumber_logs` table
- Creates `staff_profiles` table for store information
- Sets up sample data for testing

### 2. Backend Routes
**File:** `STAFF_ROUTES.js`
- `GET /api/sellers` - List all active sellers
- `GET /api/sellers/:staffId/products` - Get products by seller
- `GET /api/staff/profile` - Get staff profile
- `PUT /api/staff/profile` - Update staff profile
- `POST /api/staff/cocolumber` - Modified to include staff_id
- `GET /api/staff/my-products` - Staff sees only their products

### 3. Frontend Components
- **SellersList.vue** - Browse all sellers
- **SellerProducts.vue** - View products from specific seller
- **StaffProfile.vue** - Staff can manage their store profile

### 4. Routing Updates
- `/sellers` - Browse sellers page
- `/sellers/:sellerId` - Seller's product page
- `/staff/profile` - Staff profile management

## 📝 Implementation Steps

### Step 1: Run Database Migration
```bash
# Connect to MySQL
mysql -u root -p

# Select your database
USE cocolytics;

# Run the migration
source DATABASE_MIGRATION.sql

# Or copy and paste the SQL commands directly
```

### Step 2: Integrate Backend Routes

Open `backend/server.js` and add the routes from `STAFF_ROUTES.js`:

**Insert after line 880 (after existing cocolumber routes):**

```javascript
// ========== SELLER MARKETPLACE ROUTES ==========

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
    `)
    res.json(sellers)
  } catch (error) {
    console.error('Error fetching sellers:', error)
    res.status(500).json({ message: 'Error fetching sellers' })
  }
})

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
    `, [req.params.staffId])
    res.json(products)
  } catch (error) {
    console.error('Error fetching seller products:', error)
    res.status(500).json({ message: 'Error fetching products' })
  }
})

// Get staff profile
app.get('/api/staff/profile', verifyToken, async (req, res) => {
  try {
    const [profile] = await pool.query(`
      SELECT * FROM staff_profiles WHERE staff_id = ?
    `, [req.userId])
    
    if (profile.length === 0) {
      // Return default profile if not exists
      const [user] = await pool.query('SELECT name FROM users WHERE id = ?', [req.userId])
      return res.json({
        store_name: user[0]?.name + "'s Store" || 'My Store',
        store_description: '',
        store_logo: null,
        contact_number: '',
        store_address: '',
        is_active: true
      })
    }
    
    res.json(profile[0])
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ message: 'Error fetching profile' })
  }
})

// Update staff profile with multer for logo upload
app.put('/api/staff/profile', verifyToken, upload.single('store_logo'), async (req, res) => {
  try {
    const { store_name, store_description, contact_number, store_address, is_active } = req.body
    const store_logo = req.file ? `/uploads/${req.file.filename}` : null

    // Check if profile exists
    const [existing] = await pool.query(
      'SELECT * FROM staff_profiles WHERE staff_id = ?',
      [req.userId]
    )

    if (existing.length === 0) {
      // Insert new profile
      await pool.query(`
        INSERT INTO staff_profiles 
        (staff_id, store_name, store_description, store_logo, contact_number, store_address, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [req.userId, store_name, store_description, store_logo, contact_number, store_address, is_active])
    } else {
      // Update existing profile
      const updateFields = {
        store_name,
        store_description,
        contact_number,
        store_address,
        is_active
      }
      
      if (store_logo) {
        updateFields.store_logo = store_logo
      }

      const updateQuery = `
        UPDATE staff_profiles 
        SET ${Object.keys(updateFields).map(key => `${key} = ?`).join(', ')}
        WHERE staff_id = ?
      `
      
      await pool.query(updateQuery, [...Object.values(updateFields), req.userId])
    }

    res.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ message: 'Error updating profile' })
  }
})

// Modify existing add cocolumber route to include staff_id
// Find the POST /api/staff/cocolumber route and update it
```

**Also modify the existing `POST /api/staff/cocolumber` route** to include staff_id:

Find this route (around line 746) and update the INSERT query:
```javascript
// From:
await pool.query(
  'INSERT INTO cocolumber_logs (size, length, stock, product_picture) VALUES (?, ?, ?, ?)',
  [size, length, stock, imagePath]
)

// To:
await pool.query(
  'INSERT INTO cocolumber_logs (size, length, stock, product_picture, staff_id) VALUES (?, ?, ?, ?, ?)',
  [size, length, stock, imagePath, req.userId]
)
```

### Step 3: Test the Implementation

1. **Run database migration:**
   ```bash
   mysql -u root -p cocolytics < DATABASE_MIGRATION.sql
   ```

2. **Restart backend:**
   ```bash
   cd backend
   npm start
   ```

3. **Test as Staff:**
   - Login as staff user
   - Go to "Store Profile" in sidebar
   - Set up your store (name, description, logo)
   - Add products (they will be linked to your staff account)

4. **Test as User:**
   - Login as regular user
   - Click "Browse Sellers" in navbar
   - Select a seller to view their products
   - Add products to cart

## 🎯 Key Features

### For Staff:
- ✅ Create and manage store profile
- ✅ Upload store logo
- ✅ Products automatically linked to their account
- ✅ Only see their own products in inventory

### For Users:
- ✅ Browse all sellers
- ✅ View seller store information
- ✅ See products by specific seller
- ✅ Add to cart from different sellers

## 🔧 Next Steps (Optional Enhancements)

### 1. Update Cart/Orders to Track Seller
Modify cart and orders to include `staff_id` so users know which seller each item comes from.

### 2. Seller Analytics
Add dashboard for staff to see:
- Total sales
- Popular products
- Customer ratings

### 3. Seller Reviews
Allow customers to rate and review sellers.

### 4. Commission System
Track sales per seller for commission calculations.

## 📱 UI Flow

```
User Journey:
Home → Browse Sellers → Select Seller → View Products → Add to Cart → Checkout

Staff Journey:
Login → Store Profile → Add Products → Manage Inventory → View Orders
```

## ⚠️ Important Notes

1. **Existing Products:** After migration, existing products will have `staff_id = NULL`. You may want to assign them to a default staff user.

2. **File Uploads:** Ensure the `backend/uploads/` directory has proper write permissions.

3. **Environment Variables:** Make sure `VITE_API_BASE_URL` is set in frontend `.env` file.

4. **Testing:** Test thoroughly with multiple staff accounts to ensure product isolation works correctly.

## 🐛 Troubleshooting

**Products not showing:**
- Check if `staff_id` is being set when creating products
- Verify database migration ran successfully
- Check browser console for API errors

**Images not loading:**
- Verify uploads directory permissions
- Check image paths in database
- Ensure VITE_API_BASE_URL is correct

**Profile not updating:**
- Check file upload size limits in backend
- Verify multer configuration
- Check database constraints

---

**Implementation is complete! All files are ready. Follow the steps above to integrate into your existing system.**
