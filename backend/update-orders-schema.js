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
    console.log('\n🔧 Updating orders table schema...\n');
    
    // Add payment_status column if it doesn't exist
    try {
      await pool.execute(`
        ALTER TABLE orders 
        ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending' 
        AFTER status
      `);
      console.log('✅ Added payment_status column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ payment_status column already exists');
      } else {
        throw error;
      }
    }
    
    // Add total_amount column if it doesn't exist (keeping total_price for compatibility)
    try {
      await pool.execute(`
        ALTER TABLE orders 
        ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0.00 
        AFTER total_price
      `);
      console.log('✅ Added total_amount column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ total_amount column already exists');
      } else {
        throw error;
      }
    }
    
    // Copy total_price values to total_amount if needed
    await pool.execute(`
      UPDATE orders 
      SET total_amount = total_price 
      WHERE total_amount IS NULL OR total_amount = 0
    `);
    console.log('✅ Synchronized total_amount with total_price');
    
    console.log('\n✅ Database schema updated successfully!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
})();
