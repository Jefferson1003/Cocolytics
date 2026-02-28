const mysql = require('mysql2/promise');

async function listAllUsers() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'cocolytics'
    });

    console.log('✅ Connected to database\n');

    const [users] = await connection.execute(
      'SELECT id, name, email, role, created_at FROM users ORDER BY id'
    );

    console.log('📋 ALL USER ACCOUNTS:\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('🔑 DEFAULT PASSWORDS TO TRY:\n');
    console.log('   staff123 (lowercase)');
    console.log('   Staff123 (capital S)');
    console.log('   password123');
    console.log('   admin123');
    console.log('\n');
    console.log(`Total users: ${users.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

listAllUsers();
