# ⚡ Staff Store Products - Quick Start (2 Minutes)

## TL;DR

3 staff stores with 10 products each = 30 products total.

### Setup (Pick one):

**SQL Method:**
```bash
cd c:\COCOLYTICS\Cocolytics\backend
mysql -u root -p cocolytics < setup-sellers.sql
```

**Node Method:**
```bash
cd c:\COCOLYTICS\Cocolytics\backend
node seed-staff-stores.js
```

### Done! ✅

Users now see 3 staff stores on dashboard with different products.

---

## The 3 Stores

| Store | Products | Stock | Specialty |
|-------|----------|-------|-----------|
| **Vina** | 10 | 920 | Premium Selection |
| **Paolo** | 10 | 670 | Farm Fresh |
| **Bala** | 10 | 610 | Organic Select |

---

## Test It (2 min)

1. Dashboard → See 3 stores
2. Click store → See 10 products
3. Add to cart → Cart shows store name
4. Order → Order shows store info

Done! 🎉

---

## Available Commands

```bash
# Setup database with products
mysql -u root -p cocolytics < setup-sellers.sql

# OR seed with Node
node seed-staff-stores.js

# Check what was created
mysql -u root -p cocolytics -e "SELECT COUNT(*) FROM cocolumber_logs;"
```

---

## That's It!

30 products across 3 stores.
Users can shop from favorite sellers.
All automatic. No more work needed.

🏪 **Ready to go!**
