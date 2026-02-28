const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testPasswords() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'cocolytics'
    });

    console.log('✅ Connected to database\n');
    console.log('🔐 TESTING PASSWORDS FOR ALL ACCOUNTS\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const [users] = await connection.execute(
      'SELECT id, name, email, role, password FROM users ORDER BY id'
    );

    const passwordsToTest = [
      'staff123',
      'Staff123', 
      'password',
      'password123',
      'admin123',
      '123456',
      'user123'
    ];

    for (const user of users) {
      console.log(`\n👤 ${user.name} (${user.email}) - Role: ${user.role}`);
      console.log('   Testing passwords...');
      
      let foundPassword = false;
      for (const testPassword of passwordsToTest) {
        const isMatch = await bcrypt.compare(testPassword, user.password);
        if (isMatch) {
          console.log(`   ✅ PASSWORD FOUND: "${testPassword}"`);
          foundPassword = true;
          break;
        }
      }
      
      if (!foundPassword) {
        console.log('   ❌ Password not in common list (try the passwords shown below)');
      }
    }

    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('\n📝 SUMMARY - WORKING LOGIN CREDENTIALS:\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testPasswords();
