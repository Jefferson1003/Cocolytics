const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cocolytics'
};

async function setupMultiSeller() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 Starting multi-seller setup...\n');

    // Step 1: Add staff_id column to cocolumber_logs
    console.log('📝 Adding staff_id column to cocolumber_logs...');
    try {
      await connection.query(`
        ALTER TABLE cocolumber_logs 
        ADD COLUMN staff_id INT DEFAULT NULL
      `);
      console.log('✓ Column added\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ Column already exists\n');
      } else {
        throw error;
      }
    }

    // Step 2: Create staff_profiles table
    console.log('📝 Creating staff_profiles table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS staff_profiles (
        id INT NOT NULL AUTO_INCREMENT,
        staff_id INT NOT NULL,
        store_name VARCHAR(100) NOT NULL,
        store_description TEXT,
        store_logo VARCHAR(255),
        contact_number VARCHAR(20),
        store_address TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_staff_id (staff_id),
        CONSTRAINT fk_staff_profile_user FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Table created\n');

    // Step 3: Hash password for staff users
    const password = 'staff123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 4: Create 3 staff users
    console.log('👥 Creating staff users...');
    const staffUsers = [
      { name: 'Vina', email: 'vina@cocolytics.com' },
      { name: 'Paolo', email: 'paolo@cocolytics.com' },
      { name: 'Bala', email: 'bala@cocolytics.com' }
    ];

    const staffIds = {};

    for (const user of staffUsers) {
      const [existing] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [user.email]
      );

      if (existing.length > 0) {
        staffIds[user.name.toLowerCase()] = existing[0].id;
        console.log(`  ✓ ${user.name} already exists (ID: ${existing[0].id})`);
      } else {
        const [result] = await connection.query(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [user.name, user.email, hashedPassword, 'staff']
        );
        staffIds[user.name.toLowerCase()] = result.insertId;
        console.log(`  ✓ Created ${user.name} (ID: ${result.insertId})`);
      }
    }
    console.log('');

    // Step 5: Create store profiles
    console.log('🏪 Creating store profiles...');
    const stores = [
      {
        staffId: staffIds.vina,
        name: 'Vina Store',
        description: 'Premium coconut products handpicked by Vina. Quality guaranteed!',
        contact: '+63 917 123 4567'
      },
      {
        staffId: staffIds.paolo,
        name: 'Paolo Store',
        description: 'Fresh coconuts directly from the farm. Paolo brings you the best!',
        contact: '+63 918 234 5678'
      },
      {
        staffId: staffIds.bala,
        name: 'Bala Store',
        description: 'Organic coconut selection by Bala. Healthy and delicious!',
        contact: '+63 919 345 6789'
      }
    ];

    for (const store of stores) {
      const [existing] = await connection.query(
        'SELECT id FROM staff_profiles WHERE staff_id = ?',
        [store.staffId]
      );

      if (existing.length > 0) {
        console.log(`  ✓ ${store.name} profile already exists`);
      } else {
        await connection.query(
          `INSERT INTO staff_profiles (staff_id, store_name, store_description, contact_number, is_active)
           VALUES (?, ?, ?, ?, TRUE)`,
          [store.staffId, store.name, store.description, store.contact]
        );
        console.log(`  ✓ Created ${store.name} profile`);
      }
    }
    console.log('');

    // Step 6: Create sample products for each seller
    console.log('📦 Creating sample products...');
    const products = [
      // Vina Store Products
      { size: 'Extra Large', length: 25, stock: 50, staffId: staffIds.vina },
      { size: 'Large', length: 22, stock: 75, staffId: staffIds.vina },
      { size: 'Medium', length: 18, stock: 100, staffId: staffIds.vina },
      
      // Paolo Store Products
      { size: 'Premium', length: 24, stock: 60, staffId: staffIds.paolo },
      { size: 'Standard', length: 20, stock: 80, staffId: staffIds.paolo },
      { size: 'Small', length: 15, stock: 120, staffId: staffIds.paolo },
      
      // Bala Store Products
      { size: 'Jumbo', length: 28, stock: 40, staffId: staffIds.bala },
      { size: 'Regular', length: 21, stock: 90, staffId: staffIds.bala },
      { size: 'Mini', length: 16, stock: 110, staffId: staffIds.bala }
    ];

    for (const product of products) {
      await connection.query(
        `INSERT INTO cocolumber_logs (size, length, stock, staff_id, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [product.size, product.length, product.stock, product.staffId]
      );
    }
    console.log('  ✓ Created 9 sample products (3 per store)\n');

    // Step 7: Display summary
    console.log('✅ Multi-seller setup completed successfully!\n');
    console.log('📊 Summary:');
    console.log('  • 3 Staff Users Created: Vina, Paolo, Bala');
    console.log('  • 3 Store Profiles Created');
    console.log('  • 9 Sample Products Created (3 per store)');
    console.log('\n🔐 Login Credentials:');
    console.log('  Email: vina@cocolytics.com | Password: staff123');
    console.log('  Email: paolo@cocolytics.com | Password: staff123');
    console.log('  Email: bala@cocolytics.com | Password: staff123');
    console.log('\n🚀 You can now browse sellers at: /sellers');

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the setup
setupMultiSeller().catch(console.error);
