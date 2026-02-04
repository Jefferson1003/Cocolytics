// Quick database check script
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cocolytics'
    });

    console.log('✅ Connected to database\n');

    // Check users
    const [users] = await connection.query('SELECT id, name, email, role FROM users');
    console.log(`👥 Users: ${users.length}`);
    users.forEach(u => console.log(`   - ${u.name} (${u.email}) - ${u.role}`));

    // Check products
    const [products] = await connection.query('SELECT id, size, length, stock FROM cocolumber_logs');
    console.log(`\n🌴 Products: ${products.length}`);
    products.forEach(p => console.log(`   - ${p.size} (${p.length}cm) - Stock: ${p.stock}`));

    // Check orders
    const [orders] = await connection.query(`
      SELECT o.id, u.name as user_name, c.size, o.quantity, o.status, o.created_at
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN cocolumber_logs c ON o.cocolumber_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);
    console.log(`\n📦 Recent Orders: ${orders.length}`);
    orders.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString();
      console.log(`   - Order #${o.id}: ${o.user_name} ordered ${o.quantity}x ${o.size} - ${o.status} (${date})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();
