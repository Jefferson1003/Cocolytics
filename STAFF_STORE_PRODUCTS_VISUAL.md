# 🏪 Staff Store Products Visual Guide

## Store Structure Overview

```
COCOLYTICS MARKETPLACE
│
├─ 🏪 VINA'S PREMIUM STORE
│  │
│  ├─ Extra Large 26cm (45 units) ─┐
│  ├─ Extra Large 25cm (55 units) ─┤
│  │                                ├─ Premium Products
│  ├─ Large 23cm (60 units) ────────┤ High Quality
│  ├─ Large 22cm (70 units) ────────┤ Carefully Selected
│  ├─ Large 21cm (80 units) ────────┤
│  │                                │
│  ├─ Medium 19cm (90 units) ───────┤
│  ├─ Medium 18cm (100 units) ──────┤
│  ├─ Medium 17cm (110 units) ──────┤
│  │                                │
│  ├─ Small 15cm (120 units) ───────┤
│  └─ Small 14cm (130 units) ───────┘
│     Total: 10 SKUs, 920 units
│
├─ 🏪 PAOLO'S FARM FRESH STORE
│  │
│  ├─ Premium Large 24cm (35 units) ┐
│  ├─ Premium Large 23cm (40 units) ├─ Premium Selections
│  │                                │ Direct from Farm
│  ├─ Standard Large 22cm (50) ────┐│ Fresh Products
│  ├─ Standard Large 21cm (55) ────┼┤
│  ├─ Standard Medium 20cm (70) ───┤│
│  ├─ Standard Medium 19cm (75) ───┤│
│  ├─ Standard Small 16cm (100) ───┘│
│  ├─ Standard Small 15cm (110) ────┤
│  │                                │
│  ├─ Economy 14cm (140 units) ─────┤ Budget Friendly
│  └─ Economy 13cm (150 units) ─────┘
│     Total: 10 SKUs, 670 units
│
└─ 🏪 BALA'S ORGANIC SELECT
   │
   ├─ Organic Jumbo 28cm (25 units) ┐
   ├─ Organic Jumbo 27cm (30 units) ├─ Premium Selection
   │                                │ Certified Organic
   ├─ Organic XL 26cm (35 units) ───┤ Best Quality
   ├─ Organic XL 25cm (40 units) ───┤
   ├─ Organic Large 24cm (50) ──────┤
   ├─ Organic Large 23cm (55) ──────┤
   │                                │
   ├─ Organic Medium 20cm (80) ─────┤
   ├─ Organic Medium 19cm (85) ─────┤
   │                                │
   ├─ Organic Small 17cm (100) ─────┤
   └─ Organic Small 16cm (110) ─────┘
      Total: 10 SKUs, 610 units
```

---

## Product Categories

### By Price Tier (Implied)

```
TIER 1: PREMIUM (Most Expensive)
  └─ Bala's Organic (Certified)
  └─ Vina's Extra Large/Large Premium
  └─ Paolo's Premium Large

TIER 2: STANDARD (Mid-Range)
  └─ Vina's Medium/Small
  └─ Paolo's Standard (all sizes)
  └─ Bala's Organic (medium/small)

TIER 3: ECONOMY (Budget)
  └─ Paolo's Economy
```

### By Size Range

```
LARGE SIZES (26cm+)
  ├─ Vina: Extra Large (26, 25)
  ├─ Paolo: Premium Large (24, 23)
  └─ Bala: Organic Jumbo (28, 27) + XL (26, 25)

MEDIUM SIZES (19-23cm)
  ├─ Vina: Large (23, 22, 21) + Medium (19, 18, 17)
  ├─ Paolo: Standard Large (22, 21) + Medium (20, 19)
  └─ Bala: Organic Large (24, 23) + Medium (20, 19)

SMALL SIZES (<18cm)
  ├─ Vina: Small (15, 14)
  ├─ Paolo: Standard Small (16, 15) + Economy (14, 13)
  └─ Bala: Organic Small (17, 16)
```

### By Stock Levels

```
HIGH STOCK (100+ units)
  ├─ Vina Small (120-130)
  ├─ Vina Medium (90-110)
  ├─ Paolo Economy (140-150)
  ├─ Paolo Standard Small (100-110)
  └─ Bala Organic Small (100-110)

MEDIUM STOCK (50-99 units)
  ├─ Vina Large (60-80)
  ├─ Paolo Standard (50-75)
  └─ Bala Organic Large & Medium (50-85)

LOW STOCK (<50 units)
  ├─ Vina Extra Large (45-55)
  ├─ Paolo Premium Large (35-40)
  └─ Bala Organic Jumbo & XL (25-40)
```

---

## User Shopping Experience

### Scenario 1: Customer Wants Premium Quality
```
Customer searches for "premium"
  ↓
Dashboard → Staff Stores
  ↓
Sees: Bala's Organic Select (⭐⭐⭐⭐⭐)
Also sees: Vina's Premium Store
Also sees: Paolo's Premium Large
  ↓
Clicks "Visit Store" on Bala
  ↓
Sees 10 organic products ranging from Jumbo (28cm) to Small (16cm)
  ↓
Selects "Organic Jumbo 28cm" (Limited: 25 units available)
  ↓
Adds 2 units to cart
  ↓
Cart shows: "Organic Jumbo 28cm × 2 - From: Bala's Organic Select"
```

### Scenario 2: Customer Wants Budget Option
```
Customer is price-sensitive
  ↓
Dashboard → Staff Stores
  ↓
Sees Paolo's Farm Fresh (known for economy options)
  ↓
Clicks "Visit Store" on Paolo
  ↓
Sees "Economy" products at lowest prices
  ↓
Selects "Economy 14cm" (High stock: 140 units)
  ↓
Adds 10 units to cart (bulk purchase)
  ↓
Cart shows: "Economy 14cm × 10 - From: Paolo Farm Fresh"
```

### Scenario 3: Customer Wants Variety
```
Customer wants to try different stores
  ↓
Dashboard → Staff Stores (sees all 3 options)
  ↓
Visit Vina Store → Add Large 22cm (70 stock)
  ↓
Visit Paolo Store → Add Standard Medium 20cm (70 stock)
  ↓
Visit Bala Store → Add Organic Large 24cm (50 stock)
  ↓
Cart shows:
  ├─ Large 22cm × 1 - From: Vina's Premium Store
  ├─ Standard Medium 20cm × 1 - From: Paolo Farm Fresh
  └─ Organic Large 24cm × 1 - From: Bala's Organic Select
  ↓
Place Order
  ↓
Order History shows 3 separate line items from 3 different stores
```

---

## Product Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│ VINA'S PREMIUM STORE - SPECIALTIES                              │
├─────────────────────────────────────────────────────────────────┤
│ Size Distribution:  ████████████ Extra Large
│                     ██████████████ Large
│                     ██████████████ Medium
│                     ██████████████ Small
│                                                                   │
│ Stock Levels:       Low  ┌─────┬────┬────┬──────┐ High         │
│ (by size)              │XL │Large│Med │Small│                 │
│                        └─────┴────┴────┴──────┘                 │
│                        45-55  60-80  90-110 120-130             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PAOLO'S FARM FRESH - SPECIALTIES                                │
├─────────────────────────────────────────────────────────────────┤
│ Size Distribution:  ███████ Premium Large
│                     ███████ Standard Large
│                     ███████ Standard Medium
│                     ███████ Standard Small
│                     ████████ Economy
│                                                                   │
│ Stock Levels:       Low  ┌──────┬───────┬───────┐ High         │
│ (by tier)              │Prem  │Stand  │Economy│                │
│                        └──────┴───────┴───────┘                 │
│                        35-55   70-110  140-150                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BALA'S ORGANIC SELECT - SPECIALTIES                             │
├─────────────────────────────────────────────────────────────────┤
│ Size Distribution:  ████████████ Organic Jumbo
│                     ██████████████ Organic XL
│                     ██████████████ Organic Large
│                     ██████████████ Organic Medium
│                     ██████████████ Organic Small
│                                                                   │
│ Stock Levels:       Low  ┌──────┬────┬────────┐ High           │
│ (by size)              │Jumbo │XL  │Lg+Med  │Small│            │
│                        └──────┴────┴────────┘                   │
│                        25-40  25-40  50-85  100-110             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Inventory Summary

```
TOTAL MARKETPLACE INVENTORY: 2,200 units

Breakdown by Store:
┌────────────────────────────────────────────┐
│ Vina's Premium Store ████████████ 42% (920)│
│ Paolo Farm Fresh     ██████ 30% (670)      │
│ Bala Organic Select  ███████ 28% (610)     │
└────────────────────────────────────────────┘

Breakdown by Size:
┌────────────────────────────────────────────┐
│ Large (XL/Jumbo)     ██████░░░░░ 27% (600)│
│ Medium               ██████████░ 45% (990)│
│ Small/Economy        ████░░░░░░ 28% (610)│
└────────────────────────────────────────────┘

Breakdown by Price Tier (Estimated):
┌────────────────────────────────────────────┐
│ Premium (Bala Org)  ███░░░░░░░░ 28% (610)│
│ Standard (Vina+P)   ████████░░░ 52% (1140)│
│ Economy (Paolo)     ████░░░░░░ 20% (450)│
└────────────────────────────────────────────┘
```

---

## Frontend Display Examples

### Staff Stores Section on Dashboard
```
╔════════════════════════════════════════════════════════════════╗
║ 🏪 Staff Stores - Shop by Seller                              ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
║  │                 │  │                 │  │                 │
║  │  [Vina Logo]    │  │ [Paolo Logo]    │  │ [Bala Logo]     │
║  │                 │  │                 │  │                 │
║  │ Vina's Premium  │  │ Paolo's Farm    │  │ Bala's Organic  │
║  │ Store           │  │ Fresh           │  │ Select          │
║  │                 │  │                 │  │                 │
║  │ 10 Products     │  │ 10 Products     │  │ 10 Products     │
║  │ 920 In Stock    │  │ 670 In Stock    │  │ 610 In Stock    │
║  │                 │  │                 │  │                 │
║  │ Visit Store →   │  │ Visit Store →   │  │ Visit Store →   │
║  └─────────────────┘  └─────────────────┘  └─────────────────┘
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### Store Detail Page Products Grid
```
╔════════════════════════════════════════════════════════════════╗
║ VINA'S PREMIUM STORE                              920 in stock │
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     ║
║  │ [Image]  │  │ [Image]  │  │ [Image]  │  │ [Image]  │     ║
║  │          │  │          │  │          │  │          │     ║
║  │Extra XL  │  │Extra XL  │  │Large 23  │  │Large 22  │     ║
║  │26cm      │  │25cm      │  │cm        │  │cm        │     ║
║  │45 stock  │  │55 stock  │  │60 stock  │  │70 stock  │     ║
║  │Add Cart  │  │Add Cart  │  │Add Cart  │  │Add Cart  │     ║
║  └──────────┘  └──────────┘  └──────────┘  └──────────┘     ║
║                                                                ║
║  [More products below...]                                     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Ready to Use!

All products are configured and ready. Just:

1. **Run setup script:** `mysql -u root -p cocolytics < setup-sellers.sql`
   OR
2. **Run seed script:** `node seed-staff-stores.js`

Then users can browse the three staff stores with 30 total products!
