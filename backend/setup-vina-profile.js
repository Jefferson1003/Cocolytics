const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cocolytics',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function setupVinaProfile() {
  try {
    console.log('🔧 Setting up Vina profile...\n');

    // Get Vina's user ID
    const [vinaUser] = await pool.execute(
      'SELECT id, name FROM users WHERE email = ?',
      ['vina@cocolytics.com']
    );

    if (vinaUser.length === 0) {
      console.error('❌ Vina account not found');
      process.exit(1);
    }

    const vinaId = vinaUser[0].id;
    console.log(`✅ Found Vina account (ID: ${vinaId})`);

    // Ensure user name is "Vina"
    await pool.execute(
      'UPDATE users SET name = ? WHERE id = ?',
      ['Vina', vinaId]
    );
    console.log('✅ Updated user name to "Vina"');

    // Ensure staff profile exists and has correct details
    const [existingProfile] = await pool.execute(
      'SELECT id FROM staff_profiles WHERE staff_id = ?',
      [vinaId]
    );

    if (existingProfile.length > 0) {
      await pool.execute(
        'UPDATE staff_profiles SET store_name = ?, store_description = ?, contact_number = ?, is_active = TRUE WHERE staff_id = ?',
        ['Vina Store', 'Premium coconut products handpicked by Vina. Quality guaranteed!', '+63 917 123 4567', vinaId]
      );
      console.log('✅ Updated Vina Store profile');
    } else {
      await pool.execute(
        'INSERT INTO staff_profiles (staff_id, store_name, store_description, contact_number, is_active) VALUES (?, ?, ?, ?, TRUE)',
        [vinaId, 'Vina Store', 'Premium coconut products handpicked by Vina. Quality guaranteed!', '+63 917 123 4567']
      );
      console.log('✅ Created Vina Store profile');
    }

    // Verify the setup
    const [finalProfile] = await pool.execute(
      `SELECT u.id, u.name, u.email, sp.store_name, sp.store_description, sp.contact_number, sp.is_active
       FROM users u
       LEFT JOIN staff_profiles sp ON u.id = sp.staff_id
       WHERE u.id = ?`,
      [vinaId]
    );

    if (finalProfile.length > 0) {
      const profile = finalProfile[0];
      console.log('\n✅ Vina Profile Summary:');
      console.log(`   Name: ${profile.name}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Store Name: ${profile.store_name}`);
      console.log(`   Description: ${profile.store_description}`);
      console.log(`   Contact: ${profile.contact_number}`);
      console.log(`   Active: ${profile.is_active ? 'Yes' : 'No'}`);
      console.log('\n✅ Vina profile is ready!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up Vina profile:', error.message);
    process.exit(1);
  }
}

setupVinaProfile();
