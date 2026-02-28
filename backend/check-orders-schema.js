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
    const [cols] = await pool.execute('DESCRIBE orders');
    console.log('\n📋 Orders table columns:\n');
    cols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
})();
