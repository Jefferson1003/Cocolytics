const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cocolytics'
});

async function seedReportsData() {
  try {
    console.log('🌱 Seeding test data for staff reports...\n');
    
    // Get first staff member
    const [staffMembers] = await pool.query(`
      SELECT id FROM users WHERE role = 'staff' LIMIT 1
    `);
    
    if (staffMembers.length === 0) {
      console.log('⚠️  No staff members found. Create a staff account first!');
      process.exit(0);
    }
    
    const staffId = staffMembers[0].id;
    console.log(`👤 Using Staff ID: ${staffId}`);
    
    // Get some existing products
    const [products] = await pool.query(`SELECT id FROM cocolumber_logs LIMIT 5`);
    
    if (products.length === 0) {
      console.log('⚠️  No products found. Seed products first!');
      process.exit(0);
    }
    
    console.log(`📦 Found ${products.length} products\n`);
    
    // Update existing orders to assign to staff
    await pool.query(`
      UPDATE orders SET staff_id = ?, rating = ROUND(RAND() * 5, 1) LIMIT 5
    `, [staffId]);
    
    console.log('✅ Updated existing orders with staff_id');
    
    // Create additional test orders for this month
    const testOrders = [
      { quantity: 20, price: 500, month: 0 },    // This month
      { quantity: 15, price: 450, month: 0 },    // This month
      { quantity: 25, price: 600, month: 0 },    // This month
      { quantity: 10, price: 300, month: 1 },    // Last month
      { quantity: 8, price: 250, month: 1 },     // Last month
      { quantity: 30, price: 800, month: 2 },    // 2 months ago
    ];
    
    for (const order of testOrders) {
      const date = new Date();
      date.setMonth(date.getMonth() - order.month);
      
      const productId = products[Math.floor(Math.random() * products.length)].id;
      
      await pool.execute(`
        INSERT INTO orders (user_id, cocolumber_id, quantity, staff_id, total_price, status, rating, created_at)
        VALUES (?, ?, ?, ?, ?, 'completed', ?, ?)
      `, [staffId, productId, order.quantity, staffId, order.price, Math.round(Math.random() * 5 + 3), date]);
    }
    
    console.log('✅ Created test orders for this month and previous months\n');
    
    // Verify data
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(quantity) as total_items,
        ROUND(SUM(total_price), 2) as total_revenue,
        ROUND(AVG(rating), 1) as avg_rating
      FROM orders WHERE staff_id = ?
    `, [staffId]);
    
    console.log('📊 Staff Reports Data Summary:');
    console.log(`  Total Orders: ${stats[0].total_orders}`);
    console.log(`  Total Items: ${stats[0].total_items}`);
    console.log(`  Total Revenue: ₱${stats[0].total_revenue}`);
    console.log(`  Avg Rating: ${stats[0].avg_rating}⭐\n`);
    
    console.log('✨ Test data seeded successfully!');
    console.log(`🔗 You can now view reports for Staff ID: ${staffId}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedReportsData();
