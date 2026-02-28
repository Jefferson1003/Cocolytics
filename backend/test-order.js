const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cocolytics'
  });

  try {
    console.log('\n🛒 Testing Order Creation...\n');
    
    // Get a test product
    const [products] = await pool.execute(
      'SELECT id, size, length, stock, staff_id FROM cocolumber_logs WHERE stock > 5 LIMIT 1'
    );
    
    if (products.length === 0) {
      console.log('❌ No products available for testing');
      return;
    }
    
    const product = products[0];
    console.log(`📦 Using product: ID ${product.id} | ${product.size} (${product.length}cm) | Stock: ${product.stock}`);
    
    // Get test user
    const [users] = await pool.execute(
      "SELECT id, email, name FROM users WHERE role = 'staff' LIMIT 1"
    );
    
    if (users.length === 0) {
      console.log('❌ No staff user found');
      return;
    }
    
    const user = users[0];
    console.log(`👤 User: ${user.name} (${user.email})`);
    
    // Create test order (COD)
    const orderQuantity = 2;
    const paymentMethod = 'cash_on_delivery';
    const paymentStatus = 'pending_cod';
    const deliveryAddress = 'John Doe | 123 Main St, Barangay 1, Manila, Metro Manila | Tel: 09171234567';
    const itemPrice = 300.00; // Example price
    const totalAmount = itemPrice * orderQuantity;
    
    console.log(`\n💰 Creating order...`);
    console.log(`   Quantity: ${orderQuantity}`);
    console.log(`   Payment: ${paymentMethod}`);
    console.log(`   Total: ₱${totalAmount.toFixed(2)}`);
    
    // Insert order
    const [result] = await pool.execute(
      `INSERT INTO orders (user_id, cocolumber_id, quantity, status, staff_id, payment_status, total_amount, order_notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        product.id,
        orderQuantity,
        'pending',
        product.staff_id || null,
        paymentStatus,
        totalAmount,
        `Payment method: ${paymentMethod} | Delivery Address: ${deliveryAddress}`
      ]
    );
    
    const orderId = result.insertId;
    
    // Update stock
    await pool.execute(
      'UPDATE cocolumber_logs SET stock = stock - ? WHERE id = ?',
      [orderQuantity, product.id]
    );
    
    console.log(`\n✅ Order created successfully!`);
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Status: pending`);
    console.log(`   Payment Status: ${paymentStatus}`);
    
    // Verify the order
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (orders.length > 0) {
      console.log(`\n📋 Order Details:`);
      console.log(`   ID: ${orders[0].id}`);
      console.log(`   User: ${orders[0].user_id}`);
      console.log(`   Product: ${orders[0].cocolumber_id}`);
      console.log(`   Quantity: ${orders[0].quantity}`);
      console.log(`   Total: ₱${orders[0].total_amount}`);
      console.log(`   Status: ${orders[0].status}`);
      console.log(`   Payment Status: ${orders[0].payment_status}`);
    }
    
    // Check updated stock
    const [updatedProduct] = await pool.execute(
      'SELECT stock FROM cocolumber_logs WHERE id = ?',
      [product.id]
    );
    
    console.log(`\n📦 Stock updated: ${product.stock} → ${updatedProduct[0].stock}`);
    console.log(`\n✅ Order placement is working! 🎉\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
})();
