const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cocolytics',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function seedUser() {
  try {
    // Create users table if not exists
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff', 'user', 'warehouse', 'trader') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY email_unique (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Hash the password
    const hashedPassword = await bcrypt.hash('staff123', 10);

    // Check if user exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      ['staff@gmail.com']
    );

    if (existing.length > 0) {
      console.log('✅ Staff user already exists (staff@gmail.com)');
      process.exit(0);
    }

    // Insert test staff user
    await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Test Staff', 'staff@gmail.com', hashedPassword, 'staff']
    );

    console.log('✅ Test staff user created: staff@gmail.com / staff123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedUser();
