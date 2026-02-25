// Database initialization script
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  let connection;
  
  try {
    // Connect to MySQL (without selecting a database first)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'cocolytics'}\``);
    console.log(`✅ Database '${process.env.DB_NAME || 'cocolytics'}' created/verified`);

    // Use the database
    await connection.query(`USE \`${process.env.DB_NAME || 'cocolytics'}\``);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user','staff','admin') DEFAULT 'user',
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY email (email),
        KEY idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Users table created/verified');

    // Create cocolumber_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cocolumber_logs (
        id INT NOT NULL AUTO_INCREMENT,
        size VARCHAR(50) NOT NULL,
        length DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        product_picture VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_size (size),
        KEY idx_stock (stock)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Cocolumber_logs table created/verified');

    // Create orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        cocolumber_id INT NOT NULL,
        quantity INT NOT NULL CHECK (quantity > 0),
        status ENUM('pending','processing','completed','cancelled') DEFAULT 'pending',
        order_notes TEXT,
        total_price DECIMAL(10,2) DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY cocolumber_id (cocolumber_id),
        KEY idx_status (status),
        KEY idx_created_at (created_at),
        CONSTRAINT orders_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT orders_ibfk_2 FOREIGN KEY (cocolumber_id) REFERENCES cocolumber_logs (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Orders table created/verified');

    // Create paper_uploads table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS paper_uploads (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        file_path VARCHAR(255) NOT NULL,
        paper_type ENUM('to_cut', 'transport') DEFAULT 'to_cut',
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        reviewed_by INT DEFAULT NULL,
        review_note VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY reviewed_by (reviewed_by),
        KEY idx_status (status),
        KEY idx_paper_type (paper_type),
        CONSTRAINT paper_uploads_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT paper_uploads_ibfk_2 FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Paper_uploads table created/verified');

    // Create stock_transactions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stock_transactions (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        user_id INT DEFAULT NULL,
        transaction_type ENUM('stock_in','dispatch','adjust') NOT NULL,
        quantity INT NOT NULL,
        reason VARCHAR(255),
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY product_id (product_id),
        KEY user_id (user_id),
        KEY transaction_type (transaction_type),
        CONSTRAINT stock_trans_ibfk_1 FOREIGN KEY (product_id) REFERENCES cocolumber_logs (id) ON DELETE CASCADE,
        CONSTRAINT stock_trans_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Stock_transactions table created/verified');

    // Create warehouse_dispatches table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS warehouse_dispatches (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        user_id INT DEFAULT NULL,
        quantity INT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        date_released DATETIME NOT NULL,
        notes TEXT,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY product_id (product_id),
        KEY user_id (user_id),
        KEY date_released (date_released),
        CONSTRAINT warehouse_disp_ibfk_1 FOREIGN KEY (product_id) REFERENCES cocolumber_logs (id) ON DELETE CASCADE,
        CONSTRAINT warehouse_disp_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Warehouse_dispatches table created/verified');

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure you have at least one user account');
    console.log('2. Add some coconut products (cocolumber_logs)');
    console.log('3. Start placing orders!');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the initialization
initializeDatabase();
