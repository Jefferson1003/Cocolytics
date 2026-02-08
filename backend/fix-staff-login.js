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

async function fixStaffLogin() {
  try {
    console.log('🔧 Fixing staff account login...\n');

    // Generate the correct bcrypt hash for Staff123
    const passwordHash = await bcrypt.hash('Staff123', 10);
    console.log('✅ Generated password hash:', passwordHash);

    const staffAccounts = [
      { name: 'Vina', email: 'vina@cocolytics.com' },
      { name: 'Paolo', email: 'paolo@cocolytics.com' },
      { name: 'Bala', email: 'bala@cocolytics.com' }
    ];

    for (const staff of staffAccounts) {
      // Check if user exists
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [staff.email]
      );

      if (existing.length > 0) {
        // Update existing user
        await pool.execute(
          'UPDATE users SET password = ?, role = ? WHERE email = ?',
          [passwordHash, 'staff', staff.email]
        );
        console.log(`✅ Updated existing ${staff.name} account (${staff.email})`);
      } else {
        // Insert new user
        await pool.execute(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [staff.name, staff.email, passwordHash, 'staff']
        );
        console.log(`✅ Created new ${staff.name} account (${staff.email})`);
      }
    }

    // Get staff IDs for store setup
    const [vina] = await pool.execute('SELECT id FROM users WHERE email = ?', ['vina@cocolytics.com']);
    const [paolo] = await pool.execute('SELECT id FROM users WHERE email = ?', ['paolo@cocolytics.com']);
    const [bala] = await pool.execute('SELECT id FROM users WHERE email = ?', ['bala@cocolytics.com']);

    if (vina.length > 0 && paolo.length > 0 && bala.length > 0) {
      const vinaId = vina[0].id;
      const paoloId = paolo[0].id;
      const balaId = bala[0].id;

      console.log(`\n📝 Staff IDs: Vina=${vinaId}, Paolo=${paoloId}, Bala=${balaId}`);

      // Create or update staff profiles
      const stores = [
        { staffId: vinaId, storeName: 'Vina Store', desc: 'Premium coconut products handpicked by Vina. Quality guaranteed!', contact: '+63 917 123 4567' },
        { staffId: paoloId, storeName: 'Paolo Store', desc: 'Fresh coconuts directly from the farm. Paolo brings you the best!', contact: '+63 918 234 5678' },
        { staffId: balaId, storeName: 'Bala Store', desc: 'Organic coconut selection by Bala. Healthy and delicious!', contact: '+63 919 345 6789' }
      ];

      for (const store of stores) {
        const [existing] = await pool.execute(
          'SELECT id FROM staff_profiles WHERE staff_id = ?',
          [store.staffId]
        );

        if (existing.length > 0) {
          await pool.execute(
            'UPDATE staff_profiles SET store_name = ?, store_description = ?, contact_number = ?, is_active = TRUE WHERE staff_id = ?',
            [store.storeName, store.desc, store.contact, store.staffId]
          );
          console.log(`✅ Updated ${store.storeName} profile`);
        } else {
          await pool.execute(
            'INSERT INTO staff_profiles (staff_id, store_name, store_description, contact_number, is_active) VALUES (?, ?, ?, ?, TRUE)',
            [store.staffId, store.storeName, store.desc, store.contact]
          );
          console.log(`✅ Created ${store.storeName} profile`);
        }
      }
    }

    console.log('\n✅ All staff accounts fixed and ready!');
    console.log('\n📝 Login credentials:');
    console.log('   Vina: vina@cocolytics.com / Staff123');
    console.log('   Paolo: paolo@cocolytics.com / Staff123');
    console.log('   Bala: bala@cocolytics.com / Staff123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing staff login:', error.message);
    process.exit(1);
  }
}

fixStaffLogin();
