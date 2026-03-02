const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cocolytics',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function createTestUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insert test user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?',
      ['Test Admin', 'admin@test.com', hashedPassword, 'admin', hashedPassword]
    );

    console.log('✅ Test admin user created/updated:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');

    // Also create a test staff user
    const staffPassword = await bcrypt.hash('staff123', 10);
    await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?',
      ['Test Staff', 'staff@test.com', staffPassword, 'staff', staffPassword]
    );

    console.log('\n✅ Test staff user created/updated:');
    console.log('   Email: staff@test.com');
    console.log('   Password: staff123');
    console.log('   Role: staff');

    await pool.end();
    console.log('\n✅ Test users ready!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
