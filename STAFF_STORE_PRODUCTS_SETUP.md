# Staff Store Products Setup Guide

## Overview
Each staff member now has their own unique product selection:

### 🏪 Vina's Premium Store
- **Product Types:** Extra Large, Large, Medium, Small sizes
- **Characteristics:** Premium quality, carefully selected
- **Stock Levels:** 45-130 units per size
- **Total Products:** 10 different SKUs

### 🏪 Paolo's Farm Fresh Store
- **Product Types:** Premium Large, Standard sizes, Economy options
- **Characteristics:** Direct from farm, fresh selections
- **Stock Levels:** 35-150 units per size
- **Total Products:** 10 different SKUs

### 🏪 Bala's Organic Select
- **Product Types:** Organic Jumbo, XL, Large, Medium, Small
- **Characteristics:** Certified organic, premium selection
- **Stock Levels:** 25-110 units per size
- **Total Products:** 10 different SKUs

---

## Setup Instructions

### Option 1: Use SQL Script (Recommended)

```bash
# Navigate to backend folder
cd c:\COCOLYTICS\Cocolytics\backend

# Run the setup script (creates sellers and products)
mysql -u root -p cocolytics < setup-sellers.sql
```

When prompted, enter your database password.

### Option 2: Use Node Seeding Script

```bash
# Navigate to backend folder
cd c:\COCOLYTICS\Cocolytics\backend

# Seed staff store products
node seed-staff-stores.js
```

**Output you'll see:**
```
🌴 Starting staff store products seeding...

✓ Found staff: Vina (ID: 1)
✓ Created staff profile for Vina
✓ Added 10 products to Vina Premium Store

✓ Found staff: Paolo (ID: 2)
✓ Created staff profile for Paolo
✓ Added 10 products to Paolo Farm Fresh

✓ Found staff: Bala (ID: 3)
✓ Created staff profile for Bala
✓ Added 10 products to Bala Organic Select

✨ Staff store products seeding completed!

📊 Staff Store Summary:
────────────────────────────────────────────────────────────
Store: Vina Premium Store
  Email: vina@cocolytics.com
  Products: 10
  Total Stock: 920

Store: Paolo Farm Fresh
  Email: paolo@cocolytics.com
  Products: 10
  Total Stock: 670

Store: Bala Organic Select
  Email: bala@cocolytics.com
  Products: 10
  Total Stock: 610
```

---

## Verify Setup

### Check in Database

```sql
-- See all staff stores
SELECT u.id, u.name, sp.store_name, COUNT(cl.id) as product_count, SUM(cl.stock) as total_stock
FROM users u
LEFT JOIN staff_profiles sp ON u.id = sp.user_id
LEFT JOIN cocolumber_logs cl ON u.id = cl.staff_id
WHERE u.role = 'staff'
GROUP BY u.id;
```

### Check in Application

1. **Login as a User**
2. **Go to Dashboard** (`/` or `/user/dashboard`)
3. **Look for "🏪 Staff Stores - Shop by Seller"** section
4. **You should see 3 stores:**
   - Vina Premium Store
   - Paolo Farm Fresh
   - Bala Organic Select

5. **Click each store** to browse their unique products
6. **Add products to cart** from different stores
7. **Place an order** and see which store each product came from

---

## Product Details by Store

### Vina's Premium Store (10 Products)
```
Size              Length(cm)    Stock
─────────────────────────────────────
Extra Large         26          45
Extra Large         25          55
Large               23          60
Large               22          70
Large               21          80
Medium              19          90
Medium              18         100
Medium              17         110
Small               15         120
Small               14         130
                            ─────────
                    TOTAL:    920 units
```

### Paolo's Farm Fresh (10 Products)
```
Size                  Length(cm)    Stock
──────────────────────────────────────
Premium Large         24            35
Premium Large         23            40
Standard Large        22            50
Standard Large        21            55
Standard Medium       20            70
Standard Medium       19            75
Standard Small        16           100
Standard Small        15           110
Economy               14           140
Economy               13           150
                               ─────────
                        TOTAL: 670 units
```

### Bala's Organic Select (10 Products)
```
Size                Length(cm)    Stock
─────────────────────────────────────
Organic Jumbo         28          25
Organic Jumbo         27          30
Organic XL            26          35
Organic XL            25          40
Organic Large         24          50
Organic Large         23          55
Organic Medium        20          80
Organic Medium        19          85
Organic Small         17         100
Organic Small         16         110
                               ─────────
                        TOTAL: 610 units
```

---

## Test the Feature

### User Shopping Flow:

1. **Open Dashboard**
   ```
   http://localhost:5173/ (or your dev URL)
   ```

2. **See Staff Stores Section**
   - Scroll down to find "🏪 Staff Stores - Shop by Seller"
   - Should show 3 store cards

3. **Visit Vina's Store**
   - Click "Visit Store →" on Vina's card
   - See all 10 Vina products
   - Products have different sizes/lengths

4. **Visit Paolo's Store**
   - Click "Visit Store →" on Paolo's card
   - See all 10 Paolo products
   - Notice different naming (Premium, Standard, Economy)

5. **Visit Bala's Store**
   - Click "Visit Store →" on Bala's card
   - See all 10 Bala products
   - Notice "Organic" labeling

6. **Shop Across Stores**
   - Add items from Vina's store to cart
   - Go to Paolo's store, add items
   - Go to Bala's store, add items
   - **Cart shows which store each item is from**

7. **Place Order**
   - Checkout with mixed store items
   - **Each order remembers which store it came from**

8. **Check Order History**
   - Go to User Orders page
   - **See store name, logo, and contact info for each order**

---

## API Testing

### Get All Staff Stores
```bash
curl http://localhost:3000/api/staff-stores
```

**Response includes:**
- store_name, product_count, total_stock for each store

### Get Vina's Products
```bash
curl http://localhost:3000/api/staff-stores/1/products
```

### Get Paolo's Products
```bash
curl http://localhost:3000/api/staff-stores/2/products
```

### Get Bala's Products
```bash
curl http://localhost:3000/api/staff-stores/3/products
```

---

## Customizing Products

### To add more products for a staff store:

**Using SQL:**
```sql
-- Add to Vina's store
INSERT INTO cocolumber_logs (size, length, stock, staff_id, created_at)
VALUES ('Ultra Premium', 30, 25, 1, NOW());
```

**Using Node Script (custom):**
Edit `seed-staff-stores.js` and modify the product arrays in `getProductsForStaff()` function, then run:
```bash
node seed-staff-stores.js
```

---

## Troubleshooting

### Products not showing?
- [ ] Check staff users exist: `SELECT * FROM users WHERE role='staff';`
- [ ] Check products exist: `SELECT * FROM cocolumber_logs WHERE staff_id IN (1,2,3);`
- [ ] Check staff_profiles exist: `SELECT * FROM staff_profiles;`
- [ ] Restart backend server
- [ ] Clear frontend cache (Ctrl+Shift+Del)

### Store page broken?
- [ ] Make sure at least 1 product exists for that store
- [ ] Check browser console (F12) for errors
- [ ] Check backend logs for API errors

### Can't place order from store?
- [ ] Make sure product has stock > 0
- [ ] Check network tab in browser (F12)
- [ ] Verify database connection

---

## Next Steps

1. ✅ Run setup script or seed script
2. ✅ Verify products in database
3. ✅ Test in frontend application
4. ✅ Shop from different stores
5. ✅ Place orders and check store tracking
6. ✅ Customize products as needed

---

## Files Modified

- `backend/setup-sellers.sql` - Updated with detailed products
- `backend/seed-staff-stores.js` - New seeding script

---

## Support

For issues:
1. Check database: `SELECT * FROM cocolumber_logs;`
2. Check API: `curl http://localhost:3000/api/staff-stores`
3. Check browser console: F12 → Console tab
4. Check backend logs: Terminal output

Everything should work automatically. Each staff store has unique products!
