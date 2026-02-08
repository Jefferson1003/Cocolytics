# Staff Store Accounts Feature

## Overview
Users can now browse and purchase products directly from individual staff member stores. Each staff member has their own personalized store account with profile information, inventory, and customer visibility.

## Features Implemented

### 1. Staff Store Profiles
- Each staff member can customize their store with:
  - Store name
  - Store description
  - Store logo/image
  - Contact number
  - Physical store address
  - Active/inactive status

### 2. User-Facing Store Browsing
- **Staff Stores Section** on User Dashboard
  - Displays all active staff stores
  - Shows product count and stock levels
  - Quick access to visit individual stores

- **Dedicated Store View** (`/staff-store/:staffId`)
  - Complete store details and branding
  - All products from that specific seller
  - Individual product browsing and cart management
  - Store contact information

### 3. Shopping Experience
- Users can browse products from specific staff stores
- Add products from individual stores to cart
- Cart remembers which store each product came from
- Orders are tracked with staff store information

### 4. Order Tracking
- Orders display which staff store they were purchased from
- Staff store name, logo, and contact info visible in order history
- Users can see store details for all their orders

## Backend API Endpoints

### Staff Store Endpoints

#### Get All Staff Stores
```
GET /api/staff-stores
```
Returns list of all active staff stores with product counts and stock levels.

**Response:**
```json
[
  {
    "staff_id": 1,
    "staff_name": "John Doe",
    "store_name": "John's Premium Store",
    "store_description": "Quality coconut products",
    "store_logo": "/uploads/logo.jpg",
    "contact_number": "+63 917 123 4567",
    "store_address": "123 Coconut St, Manila",
    "is_active": true,
    "product_count": 15,
    "total_stock": 250
  }
]
```

#### Get Staff Store Details
```
GET /api/staff-stores/:staffId
```
Returns detailed information about a specific staff store.

#### Get Products from Staff Store
```
GET /api/staff-stores/:staffId/products
```
Returns all products and store information for a specific seller.

**Response:**
```json
{
  "store_info": {
    "staff_id": 1,
    "staff_name": "John Doe",
    "store_name": "John's Premium Store",
    "store_logo": "/uploads/logo.jpg",
    "store_description": "Quality coconut products"
  },
  "products": [
    {
      "id": 101,
      "size": "Large",
      "length": 22,
      "stock": 50,
      "product_picture": "/uploads/product.jpg"
    }
  ]
}
```

### Order Endpoints (Enhanced)

#### Create Order
```
POST /api/orders/create
```
Orders now automatically capture the staff_id from the product being ordered.

**Request:**
```json
{
  "items": [
    {
      "id": 101,
      "quantity": 5
    }
  ]
}
```

#### Get User's Orders
```
GET /api/orders/my-orders
```
Now returns staff/store information with each order.

**Response includes:**
- `staff_id` - ID of the seller
- `staff_name` - Name of the staff member
- `store_name` - Name of the store
- `store_logo` - Store logo URL
- `contact_number` - Store contact number

## Frontend Components

### 1. StaffStoresSection Component
**File:** `src/components/StaffStoresSection.vue`

Displays available staff stores in a grid layout with:
- Store logo
- Store name and description
- Product count and stock levels
- Contact information
- "Visit Store" button

**Usage:**
```vue
<StaffStoresSection />
```

### 2. StaffStoreView Component
**File:** `src/views/StaffStoreView.vue`

Full store page showing:
- Large store header with branding
- Store details and statistics
- Product grid with images
- Add to cart functionality
- Store contact options

**Route:** `/staff-store/:staffId`

### 3. Enhanced Views
- **UserDashboard.vue** - Added StaffStoresSection
- **UserOrders.vue** - Updated to show store information in orders
- **Cart.vue** - Shows store name for each cart item

## Database Changes

### Orders Table Migration
Added `staff_id` column to track which staff member's product is being ordered:
```sql
ALTER TABLE orders ADD COLUMN staff_id INT DEFAULT NULL;
ALTER TABLE orders ADD INDEX idx_staff_id (staff_id);
```

### Staff Profiles Table
If not existing, the system creates:
```sql
CREATE TABLE IF NOT EXISTS staff_profiles (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  store_name VARCHAR(100) NOT NULL,
  store_description TEXT,
  store_logo VARCHAR(255),
  contact_number VARCHAR(20),
  store_address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_staff_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## User Flow

### For Regular Users:
1. Login to dashboard
2. See "Staff Stores - Shop by Seller" section
3. Click on a store to view all products
4. Add products from the store to cart
5. View order history with store information

### For Staff Members:
1. Access Staff Profile (`/staff/profile`)
2. Customize store name, description, logo, and contact info
3. Add products (products automatically associated with their store)
4. View orders for their store
5. Manage customer relationships

## Features in Detail

### Store Branding
- Staff can upload a custom logo
- Create unique store descriptions
- Provide contact information
- Display physical address

### Product Association
- Products created by staff are automatically linked to their store
- Only staff members can create products for their own store
- Products show staff association in all views

### Order Management
- Orders track which staff store they came from
- Customers see staff contact info in their orders
- Staff can filter orders by their store

### Stock Management
- Staff can manage inventory for their products
- Stock counts are updated when orders are placed
- Stock information shown in store views

## Security Considerations

- Staff can only edit their own store profile
- Only authenticated users can view store information
- Orders are properly associated with the correct staff member
- Contact information is protected for privacy

## Future Enhancements

1. **Store Ratings/Reviews** - Allow customers to rate individual stores
2. **Store Analytics** - Show sales metrics per store
3. **Store Customization** - Allow custom store themes/colors
4. **Store Delivery Zones** - Define delivery areas per store
5. **Store Promotions** - Run promotions per individual store
6. **Store Performance** - Track revenue and metrics per store
7. **Multi-Store** - Allow staff to manage multiple stores
8. **Store Subscription** - Premium features for stores

## Testing the Feature

### Test Staff Store Display
1. Login as a user
2. Go to dashboard
3. Scroll to "Staff Stores - Shop by Seller" section
4. Verify stores are displayed with correct information

### Test Store Browsing
1. Click "Visit Store" on any staff store
2. Verify store header shows complete information
3. Verify products are from correct seller
4. Add product to cart

### Test Order Tracking
1. Place an order with products from a staff store
2. Go to User Orders page
3. Verify order shows store name and contact info
4. Verify cart shows store name for each item

### Test Staff Profile
1. Login as staff member
2. Go to `/staff/profile`
3. Edit store information (name, description, logo, etc.)
4. Save and verify changes
5. Check if changes appear in user-facing store view

## API Integration Notes

All endpoints follow RESTful conventions and return JSON responses with:
- Successful responses: `200 OK` with data
- Errors: Appropriate HTTP status codes with error messages
- Authentication: Required where noted (authenticateToken middleware)

The system uses JWT tokens for authentication and role-based access control.
