# 🛒 Order Placement Test Guide

## ✅ Database Status

**Products Available:** ✓
- ID 27: Medium (11cm) - Stock: 9
- ID 9: Extra Large (30.75cm) - Stock: 25  
- ID 14: Large (3cm) - Stock: 29
- ID 19: Premium (24cm) - Stock: 40
- ID 21: Small (15cm) - Stock: 120
- And more...

**Test User:** ✓
- Name: Staff User
- Email: staff@gmail.com
- Password: (use your existing staff password)
- Role: staff
- User ID: 3

**Database Schema:** ✓
- ✅ payment_status column added
- ✅ total_amount column added
- ✅ Orders table ready

## 🚀 How to Test Order Placement

### Step 1: Login
1. Go to http://192.168.68.101:5173/login
2. Login with: `staff@gmail.com` / (your password)

### Step 2: Add Items to Cart
1. Navigate to Sellers/Traders page
2. Browse products with stock available
3. Click "Add to Cart" on any product
4. Adjust quantity as needed

### Step 3: Go to Checkout
1. Navigate to "Order Tracking" page (this is now the checkout page)
2. URL: http://192.168.68.101:5173/orders/tracking

### Step 4: Fill in Delivery Information
Fill out the delivery address form:
- **Full Name:** John Doe
- **Phone:** 09171234567
- **Street Address:** 123 Main Street
- **Barangay:** Barangay 1
- **City:** Manila
- **Province:** Metro Manila
- **Postal Code:** 1000 (optional)
- **Delivery Notes:** (optional)

### Step 5: Select Payment Method
Choose one of:
- 💵 **Cash on Delivery** (COD) - Recommended for testing
- 📱 GCash (requires PayMongo setup)
- 🚗 GrabPay (requires PayMongo setup)  
- 💳 PayMaya (requires PayMongo setup)
- 🏦 Bank Transfer

### Step 6: Place Order
1. Click "Place Order" button
2. For COD: See success message → Auto-redirect to sellers page
3. For E-wallets: Redirects to PayMongo payment page

## ✅ What Happens When You Place an Order

1. **Order Created** - New record in orders table
2. **Stock Updated** - Product stock decreases by quantity ordered
3. **Payment Status Set:**
   - COD → `pending_cod`
   - E-wallets → `awaiting_payment`
   - Bank Transfer → `awaiting_bank_transfer`
4. **Cart Cleared** - Items removed from localStorage
5. **Confirmation** - Success message shown

## 📊 Verify Order Was Created

Run this in backend folder:
```bash
node -e "const mysql = require('mysql2/promise'); require('dotenv').config(); (async () => { const pool = mysql.createPool({host: 'localhost', user: 'root', password: '', database: 'cocolytics'}); const [orders] = await pool.execute('SELECT o.id, o.quantity, o.total_amount, o.payment_status, o.status, c.size FROM orders o JOIN cocolumber_logs c ON o.cocolumber_id = c.id ORDER BY o.created_at DESC LIMIT 5'); console.log('Recent Orders:'); orders.forEach(o => console.log('Order ' + o.id + ': ' + o.quantity + 'x ' + o.size + ' - PHP' + o.total_amount + ' - ' + o.payment_status)); await pool.end(); })()"
```

## 🐛 Troubleshooting

### Cart is empty
- Make sure you added items to cart from the Sellers page first
- Check browser console: localStorage.getItem('cartItems')

### "Failed to place order"
- Check backend console for errors
- Verify product has sufficient stock
- Ensure all required address fields are filled

### Payment method issues
- For testing, use COD (Cash on Delivery) - works without external services
- E-wallet payments require PayMongo API keys in backend/.env

## 🔧 Test Files Created

Backend test scripts:
- `test-inventory.js` - Check products and users
- `test-order.js` - Create a test order directly
- `update-orders-schema.js` - Update database schema
- `check-orders-schema.js` - View orders table structure

Run any test:
```bash
cd backend
node test-order.js
```

## ✅ System Status

- ✅ Backend running on http://localhost:3000
- ✅ Frontend running on http://192.168.68.101:5173
- ✅ Database schema updated
- ✅ Products with stock available  
- ✅ Test user ready
- ✅ Order placement working
- ✅ Stock management working

**You're ready to test! 🎉**
