const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cocolytics'
  });

  const [users] = await pool.execute(
    'SELECT id, name, email, role FROM users WHERE role IN ("staff", "admin")'
  );

  console.log('\n✅ Available Test Accounts:\n');
  users.forEach(u => {
    console.log(`   📧 ${u.email}`);
    console.log(`   👤 Name: ${u.name}`);
    console.log(`   🔑 Role: ${u.role}`);
    console.log('');
  });

  await pool.end();
})();
