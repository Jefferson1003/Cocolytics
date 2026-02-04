// Test API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPIs() {
  console.log('🧪 Testing Cocolytics API Endpoints\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Health check
    console.log('\n1️⃣ Testing Health Check...');
    const health = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check passed:', health.data);

    // Test 2: Login to get token
    console.log('\n2️⃣ Testing Login...');
    const login = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'jeffbala@gmail.com',
      password: '123'
    });
    console.log('✅ Login successful:', login.data.user);
    const token = login.data.token;

    // Test 3: Get all products
    console.log('\n3️⃣ Testing Get All Products...');
    const products = await axios.get(`${BASE_URL}/api/cocolumber/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Found ${products.data.length} products:`);
    products.data.forEach(p => {
      console.log(`   - ${p.size} (${p.length}cm) - Stock: ${p.stock}`);
    });

    // Test 4: Get user orders
    console.log('\n4️⃣ Testing Get User Orders...');
    const orders = await axios.get(`${BASE_URL}/api/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Found ${orders.data.length} orders for this user:`);
    orders.data.forEach(o => {
      console.log(`   - Order #${o.id}: ${o.quantity}x ${o.size} - ${o.status}`);
    });

    // Test 5: Create order
    if (products.data.length > 0) {
      console.log('\n5️⃣ Testing Create Order...');
      const productToOrder = products.data.find(p => p.stock > 0);
      
      if (productToOrder) {
        const newOrder = await axios.post(
          `${BASE_URL}/api/orders/create`,
          {
            items: [
              {
                id: productToOrder.id,
                size: productToOrder.size,
                length: productToOrder.length,
                quantity: 1
              }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('✅ Order created successfully:', newOrder.data);
        
        // Verify order was created
        const updatedOrders = await axios.get(`${BASE_URL}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Now have ${updatedOrders.data.length} orders`);
      } else {
        console.log('⚠️  No products with stock available to order');
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 All API tests completed successfully!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.data}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

testAPIs();
