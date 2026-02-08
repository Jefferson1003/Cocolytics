// Seed products for different staff stores
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cocolytics',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function seedStaffStoreProducts() {
  try {
    console.log('🌴 Starting staff store products seeding...\n');

    // Get or create staff users
    const staffUsers = [
      { name: 'Vina', email: 'vina@cocolytics.com', storeName: 'Vina Premium Store' },
      { name: 'Paolo', email: 'paolo@cocolytics.com', storeName: 'Paolo Farm Fresh' },
      { name: 'Bala', email: 'bala@cocolytics.com', storeName: 'Bala Organic Select' }
    ];

    for (const staff of staffUsers) {
      // Check if user exists
      const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [staff.email]);
      
      let staffId;
      if (users.length > 0) {
        staffId = users[0].id;
        console.log(`✓ Found staff: ${staff.name} (ID: ${staffId})`);
      } else {
        console.log(`ℹ Staff ${staff.name} not found - skipping products`);
        continue;
      }

      // Check if staff profile exists
      const [profile] = await pool.execute('SELECT id FROM staff_profiles WHERE user_id = ?', [staffId]);
      
      if (profile.length === 0) {
        // Create staff profile if doesn't exist
        await pool.execute(
          'INSERT INTO staff_profiles (user_id, store_name, store_description, contact_number, is_active) VALUES (?, ?, ?, ?, TRUE)',
          [staffId, staff.storeName, `High quality coconut lumber from ${staff.name}`, `+63 9${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 999999999)}`.slice(0, 13)]
        );
        console.log(`✓ Created staff profile for ${staff.name}`);
      }

      // Delete existing products for this staff (optional - for clean seeding)
      const [deleteResult] = await pool.execute('DELETE FROM cocolumber_logs WHERE staff_id = ?', [staffId]);
      if (deleteResult.affectedRows > 0) {
        console.log(`  Cleared ${deleteResult.affectedRows} existing products`);
      }

      // Add products based on staff member
      const products = getProductsForStaff(staff.name);
      
      for (const product of products) {
        await pool.execute(
          'INSERT INTO cocolumber_logs (size, length, stock, staff_id, created_at) VALUES (?, ?, ?, ?, NOW())',
          [product.size, product.length, product.stock, staffId]
        );
      }

      console.log(`✓ Added ${products.length} products to ${staff.storeName}\n`);
    }

    console.log('✨ Staff store products seeding completed!\n');

    // Show summary
    const [summary] = await pool.execute(`
      SELECT u.name, u.email, sp.store_name, COUNT(cl.id) as product_count, SUM(cl.stock) as total_stock
      FROM users u
      LEFT JOIN staff_profiles sp ON u.id = sp.user_id
      LEFT JOIN cocolumber_logs cl ON u.id = cl.staff_id
      WHERE u.role = 'staff'
      GROUP BY u.id
    `);

    console.log('📊 Staff Store Summary:');
    console.log('─'.repeat(80));
    summary.forEach(row => {
      console.log(`Store: ${row.store_name || row.name}`);
      console.log(`  Email: ${row.email}`);
      console.log(`  Products: ${row.product_count || 0}`);
      console.log(`  Total Stock: ${row.total_stock || 0}`);
      console.log();
    });

  } catch (error) {
    console.error('❌ Error seeding staff store products:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

function getProductsForStaff(staffName) {
  const products = {
    'Vina': [
      // Premium Selection
      { size: 'Extra Large', length: 26, stock: 45 },
      { size: 'Extra Large', length: 25, stock: 55 },
      { size: 'Large', length: 23, stock: 60 },
      { size: 'Large', length: 22, stock: 70 },
      { size: 'Large', length: 21, stock: 80 },
      { size: 'Medium', length: 19, stock: 90 },
      { size: 'Medium', length: 18, stock: 100 },
      { size: 'Medium', length: 17, stock: 110 },
      { size: 'Small', length: 15, stock: 120 },
      { size: 'Small', length: 14, stock: 130 }
    ],
    'Paolo': [
      // Farm Fresh Selection
      { size: 'Premium Large', length: 24, stock: 35 },
      { size: 'Premium Large', length: 23, stock: 40 },
      { size: 'Standard Large', length: 22, stock: 50 },
      { size: 'Standard Large', length: 21, stock: 55 },
      { size: 'Standard Medium', length: 20, stock: 70 },
      { size: 'Standard Medium', length: 19, stock: 75 },
      { size: 'Standard Small', length: 16, stock: 100 },
      { size: 'Standard Small', length: 15, stock: 110 },
      { size: 'Economy', length: 14, stock: 140 },
      { size: 'Economy', length: 13, stock: 150 }
    ],
    'Bala': [
      // Organic Selection
      { size: 'Organic Jumbo', length: 28, stock: 25 },
      { size: 'Organic Jumbo', length: 27, stock: 30 },
      { size: 'Organic XL', length: 26, stock: 35 },
      { size: 'Organic XL', length: 25, stock: 40 },
      { size: 'Organic Large', length: 24, stock: 50 },
      { size: 'Organic Large', length: 23, stock: 55 },
      { size: 'Organic Medium', length: 20, stock: 80 },
      { size: 'Organic Medium', length: 19, stock: 85 },
      { size: 'Organic Small', length: 17, stock: 100 },
      { size: 'Organic Small', length: 16, stock: 110 }
    ]
  };

  return products[staffName] || [];
}

// Run the seeding
seedStaffStoreProducts();
