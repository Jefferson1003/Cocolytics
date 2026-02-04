// Seed database with sample products
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedProducts() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cocolytics'
    });

    console.log('✅ Connected to database\n');
    console.log('🌱 Seeding products with stock...\n');

    // Add sample coconut products with stock
    const products = [
      { size: 'Small', length: 15.5, stock: 100 },
      { size: 'Medium', length: 20.25, stock: 75 },
      { size: 'Large', length: 25.0, stock: 50 },
      { size: 'Extra Large', length: 30.75, stock: 25 }
    ];

    for (const product of products) {
      // Check if product already exists
      const [existing] = await connection.query(
        'SELECT id FROM cocolumber_logs WHERE size = ?',
        [product.size]
      );

      if (existing.length > 0) {
        // Update existing product
        await connection.query(
          'UPDATE cocolumber_logs SET length = ?, stock = stock + ? WHERE size = ?',
          [product.length, product.stock, product.size]
        );
        console.log(`✅ Updated ${product.size}: Added ${product.stock} units to stock`);
      } else {
        // Insert new product
        await connection.query(
          'INSERT INTO cocolumber_logs (size, length, stock) VALUES (?, ?, ?)',
          [product.size, product.length, product.stock]
        );
        console.log(`✅ Created ${product.size}: ${product.stock} units in stock`);
      }
    }

    console.log('\n🎉 Product seeding completed!');
    console.log('\n📋 Current Products:');
    
    const [allProducts] = await connection.query(
      'SELECT id, size, length, stock, created_at FROM cocolumber_logs ORDER BY length'
    );
    
    allProducts.forEach(p => {
      console.log(`   ${p.id}. ${p.size} - ${p.length}cm - Stock: ${p.stock} units`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

seedProducts();
