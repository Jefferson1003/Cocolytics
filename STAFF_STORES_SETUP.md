# Staff Store Feature - Setup & Usage Guide

## Quick Start

### What's New?
Users can now see individual staff member stores on their dashboard and purchase products directly from specific sellers. Each staff member has their own branded store with contact information and product listings.

## For Users

### Browse Staff Stores
1. **Login** to your account
2. Go to **User Dashboard** (`/` or `/user/dashboard`)
3. Scroll down to see **"🏪 Staff Stores - Shop by Seller"** section
4. View all active staff stores with:
   - Store logo and name
   - Number of products available
   - Total stock count
   - Staff member information

### Shop from a Specific Store
1. Click **"Visit Store →"** on any staff store card
2. You'll see the complete store page with:
   - Large store header with logo and branding
   - Store description and contact details
   - Location information
   - All products from that store

### Add Products to Cart
1. Browse products in the store
2. Click **"🛒 Add to Cart"** on any product
3. The product and store information are saved to your cart
4. Go to your cart to see which store each product came from

### View Orders with Store Info
1. Go to **User Orders** page
2. See all your orders with:
   - **Store Name** - Which staff store the product came from
   - **Contact Number** - Store's phone number
   - **Product Details** - Size, length, quantity
   - **Order Status** - Current status

## For Staff Members

### Set Up Your Store Profile
1. **Login** as a staff member
2. Go to **Staff Profile** (`/staff/profile`)
3. Edit your store information:
   - **Store Name** - Your store's unique name
   - **Store Description** - About your store and products
   - **Store Logo** - Upload an image
   - **Contact Number** - Your phone number
   - **Store Address** - Physical location (optional)
   - **Active Status** - Toggle to show/hide store

### Manage Your Products
1. Go to **Staff Dashboard**
2. Click **"Add Cocolumber"**
3. Add products - they automatically belong to your store
4. Products automatically show your store information to customers

### View Your Store's Orders
1. Go to **Staff Orders** page
2. See all orders for products from your store
3. Update order statuses
4. Contact customers as needed

### Update Store Branding
1. Go to **Staff Profile**
2. Change:
   - Store name (if you want to rebrand)
   - Description (update what customers see)
   - Logo (keep it fresh)
   - Contact information
3. Click **"💾 Save Profile"**
4. Changes appear immediately to customers

## Features Overview

### 🏪 Staff Store Cards (Dashboard)
Shows:
- Store logo/branding
- Store name
- Brief description
- Product count
- Stock availability
- Staff member name
- Contact number
- Status indicator (Active/Inactive)

### 📦 Store Detail Page
Displays:
- Large store header with complete branding
- Staff member information
- Store description
- Contact and location details
- Quick statistics (products, stock, status)
- Full product grid with images
- Add to cart for each product

### 🛒 Enhanced Cart
Now shows:
- Which store each product came from
- Product details (size, length)
- Quantity selector
- Remove option

### 📋 Order History
Enhanced to display:
- Store name for each order
- Staff member who sold it
- Store contact number
- Product details
- Order status and date

## Common Tasks

### As a User:
- **Find a specific store**: Scroll through Staff Stores section
- **Browse all products from one store**: Click "Visit Store"
- **Contact a seller**: Use the phone number shown in store
- **Buy from favorite store**: All products tracked by store
- **Track order source**: Orders show which store you bought from

### As a Staff Member:
- **Go online**: Activate store in Staff Profile
- **Go offline**: Deactivate store in Staff Profile  
- **Update store info**: Edit Staff Profile
- **Add inventory**: Use Add Cocolumber feature
- **Fulfill orders**: Check Staff Orders for your store
- **Connect with customers**: Use contact info to reach out

## Technical Details

### Automatic Features
- ✅ Products automatically linked to creator's store
- ✅ Orders automatically track which store they're from
- ✅ Store information automatically pulled into all views
- ✅ Stock updated automatically when orders placed
- ✅ Customer sees real-time store information

### Data Stored
- Store name and description
- Store logo (image file)
- Contact number
- Physical address
- Active/inactive status
- All products created by staff
- All orders from that store

### Privacy & Security
- Only staff can edit their own store profile
- Only authenticated users can view store information
- Contact information protected by account security
- Orders properly isolated by user and store

## Troubleshooting

### Store Not Showing?
- ✓ Check if store is set to "Active" in profile
- ✓ Make sure store has at least one product
- ✓ Refresh the page
- ✓ Check user permissions

### Products Not Appearing?
- ✓ Verify products exist in database
- ✓ Check products are linked to staff member
- ✓ Ensure staff account is active
- ✓ Clear browser cache

### Store Info Not Updated?
- ✓ Refresh browser
- ✓ Clear localStorage
- ✓ Check API is running
- ✓ Verify staff profile saved successfully

### Cart Not Showing Store?
- ✓ Add fresh product to cart
- ✓ Clear localStorage cartItems
- ✓ Check product has staff_id

## URLs Quick Reference

### User Pages
- `/` - Home/Dashboard with Staff Stores
- `/user/orders` - Browse products and view orders
- `/staff-store/:staffId` - View specific store
- `/cart` - Shopping cart

### Staff Pages
- `/staff/profile` - Edit store information
- `/staff/add-cocolumber` - Add products
- `/staff/orders` - View customer orders
- `/staff/inventory` - Manage inventory

## Support

For issues or questions about the staff store feature:
1. Check the STAFF_STORE_FEATURE.md documentation
2. Review API endpoints in backend/server.js
3. Check browser console for errors
4. Verify database migrations ran successfully

## Next Steps

After setup, consider:
1. ✓ Invite staff members to customize their stores
2. ✓ Create tutorial for staff on store management
3. ✓ Monitor orders and ensure fulfillment
4. ✓ Gather customer feedback on stores
5. ✓ Plan store features (ratings, reviews, etc.)
