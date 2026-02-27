const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function checkUsers() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cocolytics'
  });

  try {
    // Check for paolo@gmail.com
    const [paolo] = await pool.execute(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      ['paolo@gmail.com']
    );
    
    console.log('\n=== Checking paolo@gmail.com ===');
    if (paolo.length > 0) {
      const user = paolo[0];
      console.log('User found:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      
      // Test password: Staff123
      const validPaolo = await bcrypt.compare('Staff123', user.password);
      console.log(`  Password "Staff123" is: ${validPaolo ? 'CORRECT ✓' : 'WRONG ✗'}`);
      
      // Also test staff123
      const validPaolo2 = await bcrypt.compare('staff123', user.password);
      console.log(`  Password "staff123" is: ${validPaolo2 ? 'CORRECT ✓' : 'WRONG ✗'}`);
    } else {
      console.log('User NOT FOUND ✗');
    }
    
    // Check for staff@gmail.com
    const [staff] = await pool.execute(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      ['staff@gmail.com']
    );
    
    console.log('\n=== Checking staff@gmail.com ===');
    if (staff.length > 0) {
      const user = staff[0];
      console.log('User found:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      
      // Test password: staff123
      const validStaff = await bcrypt.compare('staff123', user.password);
      console.log(`  Password "staff123" is: ${validStaff ? 'CORRECT ✓' : 'WRONG ✗'}`);
      
      // Also test Staff123
      const validStaff2 = await bcrypt.compare('Staff123', user.password);
      console.log(`  Password "Staff123" is: ${validStaff2 ? 'CORRECT ✓' : 'WRONG ✗'}`);
    } else {
      console.log('User NOT FOUND ✗');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
