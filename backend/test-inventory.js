const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cocolytics'
  });

  try {
    console.log('\n📦 Checking Inventory...\n');
    
    // Check products with stock
    const [products] = await pool.execute(
      'SELECT id, size, length, stock, staff_id FROM cocolumber_logs WHERE stock > 0 LIMIT 10'
    );
    
    if (products.length === 0) {
      console.log('❌ No products with stock found!');
      console.log('➕ Adding test products...\n');
      
      // Add test products
      await pool.execute(`
        INSERT INTO cocolumber_logs (size, length, stock, staff_id, created_at, updated_at)
        VALUES 
        ('Small', 100, 50, 1, NOW(), NOW()),
        ('Medium', 150, 40, 1, NOW(), NOW()),
        ('Large', 200, 30, 1, NOW(), NOW()),
        ('Extra Large', 250, 20, 1, NOW(), NOW())
      `);
      
      // Fetch again
      const [newProducts] = await pool.execute(
        'SELECT id, size, length, stock, staff_id FROM cocolumber_logs WHERE stock > 0 LIMIT 10'
      );
      
      console.log('✅ Test products added!\n');
      newProducts.forEach(p => {
        console.log(`ID: ${p.id} | ${p.size} (${p.length}cm) | Stock: ${p.stock}`);
      });
    } else {
      console.log('✅ Products available:\n');
      products.forEach(p => {
        console.log(`ID: ${p.id} | ${p.size} (${p.length}cm) | Stock: ${p.stock}`);
      });
    }
    
    // Check users
    console.log('\n👤 Checking User...\n');
    const [users] = await pool.execute(
      "SELECT id, email, name, role FROM users WHERE role = 'staff' LIMIT 1"
    );
    
    if (users.length > 0) {
      console.log(`✅ Test User: ${users[0].name} (${users[0].email}) - Role: ${users[0].role}`);
      console.log(`   User ID: ${users[0].id}`);
    } else {
      console.log('❌ No staff user found! Please create one.');
    }
    
    console.log('\n✅ Ready to test orders!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
})();
