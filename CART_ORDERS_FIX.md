# Cart and Orders Troubleshooting Guide

## What Was Fixed

### 1. **Cart.vue Improvements**
- ✅ Added better empty state with visual feedback
- ✅ Added loading states and error messages
- ✅ Improved error handling with detailed console logging
- ✅ Added redirect after successful order placement
- ✅ Enhanced UI with better messaging

### 2. **UserOrders.vue Improvements**
- ✅ Added comprehensive error handling
- ✅ Added detailed console logging for debugging
- ✅ Improved product and order fetching with better error messages
- ✅ Added token validation on mount
- ✅ Refresh products after order submission to update stock

### 3. **Backend API Improvements**
- ✅ Added detailed console logging for debugging
- ✅ Added validation for order items (checking ID and quantity)
- ✅ Added stock validation before creating orders
- ✅ Added better error messages in responses
- ✅ Added product existence checks

### 4. **Database Initialization**
- ✅ Created `init-db.js` script to ensure all tables exist
- ✅ Added proper foreign key constraints
- ✅ Added script to package.json for easy execution

## How to Test

### Step 1: Initialize the Database
```powershell
cd c:\COCOLYTICS\Cocolytics\backend
npm run init-db
```

This will create all required tables if they don't exist.

### Step 2: Start the Backend Server
```powershell
cd c:\COCOLYTICS\Cocolytics\backend
npm start
# OR for development with auto-reload
npm run dev
```

You should see:
```
✅ Connected to MySQL database
Server is running on http://localhost:3000
```

### Step 3: Start the Frontend
```powershell
cd c:\COCOLYTICS\Cocolytics\frontend
npm run dev
```

### Step 4: Test the Flow

#### A. Add Products (Staff/Admin)
1. Login as staff or admin
2. Go to inventory management
3. Add some coconut products with stock

#### B. Create Orders (User)
1. Login as a regular user
2. Go to "My Orders" page
3. You should see:
   - **Available Products** section with coconuts
   - **Shopping Cart** section (empty initially)
   - **My Coconut Orders** section (empty if no orders yet)

4. **Add to Cart:**
   - Select quantity for a product
   - Click "Order" button
   - Item should appear in the shopping cart

5. **Place Order:**
   - Click "✓ Place Order" in the cart section
   - You should see success message
   - Cart should clear
   - Product should appear in "My Coconut Orders" section

#### C. View Cart
1. Click on the cart icon in navigation or go to `/cart`
2. You should see:
   - Items you added (if any)
   - Empty state with link to browse products (if cart is empty)
   - Ability to adjust quantities or remove items

## Debugging Guide

### If Cart Shows No Data

**Check Browser Console:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for these messages:
   ```
   Cart localStorage data: [...]
   Cart items loaded: [...]
   ```

4. If you see errors, check:
   - Is localStorage accessible?
   - Is the data format correct (should be JSON array)?

**Check localStorage:**
```javascript
// In browser console
localStorage.getItem('cartItems')
```

**Expected format:**
```json
[
  {
    "id": 1,
    "size": "Medium",
    "length": 20.5,
    "quantity": 2
  }
]
```

### If Orders Show No Data

**Check Browser Console:**
1. Look for these messages:
   ```
   Fetching user orders...
   Orders response status: 200
   Orders fetched: X items
   Orders data: [...]
   ```

**Common Issues:**

1. **Not logged in:**
   - Console should show: "No token found, redirecting to login"
   - Solution: Login first

2. **No orders exist:**
   - Console shows: "Orders fetched: 0 items"
   - This is normal - create an order first!

3. **API Error:**
   - Console shows: "Orders response status: 500" or similar
   - Check backend terminal for error messages
   - Verify database connection

4. **Database Table Missing:**
   - Run `npm run init-db` in backend folder

### Backend Debugging

**Check Backend Logs:**

When you access My Orders, you should see:
```
Fetching orders for user: 1
Found X orders for user 1
```

When you create an order, you should see:
```
Creating order for user: 1
Order items: [...]
Order created: ID X, Product: Medium, Quantity: 2
All orders created successfully: [...]
```

**Common Backend Issues:**

1. **Database not connected:**
   ```
   ❌ Database connection failed: [error]
   ```
   Solution: Check your `.env` file and MySQL server

2. **Orders table doesn't exist:**
   ```
   Error: Table 'cocolytics.orders' doesn't exist
   ```
   Solution: Run `npm run init-db`

3. **Foreign key constraint fails:**
   ```
   Error: Cannot add or update a child row: a foreign key constraint fails
   ```
   Solution: Make sure you have products (cocolumber_logs) in database

## Verification Checklist

- [ ] Backend server is running on http://localhost:3000
- [ ] Frontend is running (usually http://localhost:5173)
- [ ] Database tables exist (run `npm run init-db`)
- [ ] At least one user account exists
- [ ] At least one product exists with stock > 0
- [ ] Browser console shows no errors
- [ ] localStorage is accessible
- [ ] Token is valid (not expired)

## API Endpoints Reference

### Orders
- `GET /api/orders/my-orders` - Get user's orders
- `POST /api/orders/create` - Create new order
- `GET /api/orders/all` - Get all orders (staff/admin)
- `PUT /api/orders/:id/status` - Update order status (staff/admin)

### Products
- `GET /api/cocolumber/all` - Get all products
- `POST /api/cocolumber/add` - Add product (staff/admin)
- `PUT /api/cocolumber/:id/stock` - Update stock (staff/admin)

## Expected Console Output

### When Everything Works:

**Frontend Console (My Orders page):**
```
UserOrders mounted, token exists
Fetching available products...
Fetching user orders...
Products response status: 200
Products fetched: 3 items
Orders response status: 200
Orders fetched: 2 items
Orders data: [Array(2)]
```

**Backend Console:**
```
✅ Connected to MySQL database
Server is running on http://localhost:3000
Fetching orders for user: 1
Found 2 orders for user 1
```

## Need More Help?

1. Check browser DevTools Console for frontend errors
2. Check backend terminal for server errors
3. Verify database connection and tables
4. Make sure you're logged in with a valid token
5. Ensure products exist in the database with available stock
