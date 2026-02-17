const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cocolytics'
});

async function fixSchema() {
  try {
    console.log('🔧 Fixing database schema for reports...');
    
    // Check if staff_id exists
    const [staffIdCol] = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'staff_id' AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (staffIdCol.length === 0) {
      await pool.execute(`ALTER TABLE orders ADD COLUMN staff_id INT DEFAULT NULL`);
      console.log('✅ Added staff_id column');
    } else {
      console.log('✅ staff_id column already exists');
    }
    
    // Check if rating exists
    const [ratingCol] = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'rating' AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (ratingCol.length === 0) {
      await pool.execute(`ALTER TABLE orders ADD COLUMN rating DECIMAL(2,1) DEFAULT NULL`);
      console.log('✅ Added rating column');
    } else {
      console.log('✅ rating column already exists');
    }
    
    // Check the columns
    const [columns] = await pool.query('DESCRIBE orders');
    console.log('\n📋 Current Orders Table Structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}${col.Key ? ' (KEY)' : ''}`);
    });
    
    // Check if there are any orders
    const [orders] = await pool.query('SELECT COUNT(*) as count FROM orders');
    console.log(`\n📊 Total Orders in Database: ${orders[0].count}`);
    
    if (orders[0].count === 0) {
      console.log('⚠️  No orders found in database - need test data!');
      console.log('📝 Create some orders first to see reports.');
    }
    
    console.log('\n✨ Schema update complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixSchema();
