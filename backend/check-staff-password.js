const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cocolytics'
  });

  const [users] = await pool.execute(
    'SELECT email, password FROM users WHERE email = "staff@gmail.com"'
  );

  if (users.length > 0) {
    const user = users[0];
    console.log('\n🔍 Checking staff@gmail.com password...\n');
    
    // Test common passwords
    const testPasswords = ['staff123', 'staff', 'password', '123456'];
    
    for (const pwd of testPasswords) {
      const isMatch = await bcrypt.compare(pwd, user.password);
      if (isMatch) {
        console.log(`✅ Password is: ${pwd}\n`);
        break;
      } else {
        console.log(`❌ Not: ${pwd}`);
      }
    }
  } else {
    console.log('❌ Account not found');
  }

  await pool.end();
})();
