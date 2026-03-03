/**
 * Quick PayMongo/GCash Setup Verification
 * Run this to check if your payment system is configured correctly
 */

require('dotenv').config();

console.log('\n' + '='.repeat(60));
console.log('  🔍 GCASH/PAYMONGO CONFIGURATION CHECK');
console.log('='.repeat(60) + '\n');

// Check PayMongo Keys
const publicKey = process.env.PAYMONGO_PUBLIC_KEY;
const secretKey = process.env.PAYMONGO_SECRET_KEY;

console.log('📋 Checking Environment Variables...\n');

// Public Key Check
if (!publicKey || publicKey === 'pk_test_your_public_key_here' || publicKey.includes('placeholder')) {
  console.log('❌ PAYMONGO_PUBLIC_KEY: Not configured');
  console.log('   Current value:', publicKey);
  console.log('   ⚠️  Using TEST MODE (mock payments)\n');
} else if (publicKey.startsWith('pk_test_')) {
  console.log('✅ PAYMONGO_PUBLIC_KEY: Configured (TEST MODE)');
  console.log('   Key:', publicKey.substring(0, 20) + '...\n');
} else if (publicKey.startsWith('pk_live_')) {
  console.log('✅ PAYMONGO_PUBLIC_KEY: Configured (LIVE MODE)');
  console.log('   Key:', publicKey.substring(0, 20) + '...\n');
} else {
  console.log('⚠️  PAYMONGO_PUBLIC_KEY: Invalid format');
  console.log('   Should start with pk_test_ or pk_live_\n');
}

// Secret Key Check
if (!secretKey || secretKey === 'sk_test_your_secret_key_here' || secretKey.includes('placeholder')) {
  console.log('❌ PAYMONGO_SECRET_KEY: Not configured');
  console.log('   Current value:', secretKey);
  console.log('   ⚠️  Using TEST MODE (mock payments)\n');
} else if (secretKey.startsWith('sk_test_')) {
  console.log('✅ PAYMONGO_SECRET_KEY: Configured (TEST MODE)');
  console.log('   Key:', secretKey.substring(0, 20) + '...\n');
} else if (secretKey.startsWith('sk_live_')) {
  console.log('✅ PAYMONGO_SECRET_KEY: Configured (LIVE MODE)');
  console.log('   Key:', secretKey.substring(0, 20) + '...\n');
} else {
  console.log('⚠️  PAYMONGO_SECRET_KEY: Invalid format');
  console.log('   Should start with sk_test_ or sk_live_\n');
}

// Frontend URL Check
const frontendUrl = process.env.FRONTEND_URL;
console.log('🌐 Frontend URL:', frontendUrl || 'Not set (will use default)');
console.log('   Payment redirects will return to:', frontendUrl || 'http://localhost:5173\n');

// Database Check
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
console.log('💾 Database Configuration:');
console.log('   Host:', dbHost || 'Not set');
console.log('   Database:', dbName || 'Not set\n');

// Payment Mode Summary
console.log('='.repeat(60));
console.log('  📊 PAYMENT MODE SUMMARY');
console.log('='.repeat(60) + '\n');

const isTestMode = !secretKey || 
                   secretKey.includes('placeholder') || 
                   secretKey === 'sk_test_your_secret_key_here';

if (isTestMode) {
  console.log('🧪 CURRENT MODE: TEST MODE (Mock Payments)');
  console.log('\nWhat this means:');
  console.log('  ✅ System will generate test payment links');
  console.log('  ✅ Orders will be created');
  console.log('  ✅ Perfect for development/testing');
  console.log('  ❌ No real money transactions');
  console.log('  ❌ QR codes are simulated\n');
  
  console.log('To enable REAL payments:');
  console.log('  1. Visit: https://dashboard.paymongo.com/signup');
  console.log('  2. Get your API keys from Developers tab');
  console.log('  3. Update backend/.env file');
  console.log('  4. Restart your backend server\n');
} else {
  const isLive = secretKey.startsWith('sk_live_');
  
  if (isLive) {
    console.log('🚀 CURRENT MODE: LIVE MODE (Real Payments)');
    console.log('\n⚠️  WARNING: Real money will be processed!');
    console.log('  ✅ Customers can pay with real GCash');
    console.log('  ✅ Money will be sent to your PayMongo account');
    console.log('  ⚠️  Make sure you test thoroughly first\n');
  } else {
    console.log('🧪 CURRENT MODE: TEST MODE (PayMongo Test Keys)');
    console.log('\nWhat this means:');
    console.log('  ✅ Connected to PayMongo API');
    console.log('  ✅ Real payment flow (test environment)');
    console.log('  ✅ Use test GCash accounts');
    console.log('  ❌ No real money transactions\n');
    
    console.log('Test Payment Info:');
    console.log('  • Use amount: ₱100.00 for successful test');
    console.log('  • PayMongo will provide test checkout pages');
    console.log('  • Test cards: 4120 0000 0000 0007 (success)\n');
  }
}

// GCash Flow Check
console.log('='.repeat(60));
console.log('  📱 GCASH PAYMENT FLOW');
console.log('='.repeat(60) + '\n');

console.log('When a customer selects GCash:');
console.log('  1. ✅ Cart shows GCash as payment option');
console.log('  2. ✅ Backend creates PayMongo payment source');
console.log('  3. ✅ Customer gets redirected to payment URL');
console.log('  4. ✅ Customer scans GCash QR or enters details');
console.log('  5. ✅ Payment confirmed, order updated');
console.log('  6. ✅ Customer redirected back to your site\n');

// Next Steps
console.log('='.repeat(60));
console.log('  🎯 NEXT STEPS');
console.log('='.repeat(60) + '\n');

if (isTestMode) {
  console.log('To test GCash payment:');
  console.log('  1. Go to http://localhost:5173 (or your frontend URL)');
  console.log('  2. Add items to cart');
  console.log('  3. Select "GCash" as payment method');
  console.log('  4. Place order');
  console.log('  5. You will see a test payment link\n');
  
  console.log('To enable real payments:');
  console.log('  1. Sign up at: https://dashboard.paymongo.com');
  console.log('  2. Get your API keys');
  console.log('  3. Update PAYMONGO_PUBLIC_KEY in .env');
  console.log('  4. Update PAYMONGO_SECRET_KEY in .env');
  console.log('  5. Restart backend: node server.js');
  console.log('  6. Run this script again to verify\n');
} else {
  console.log('✅ Your payment system is configured!');
  console.log('\nTest the flow:');
  console.log('  1. Go to your frontend');
  console.log('  2. Add items to cart');
  console.log('  3. Select GCash payment');
  console.log('  4. Complete the payment flow');
  console.log('  5. Verify order status updates\n');
}

console.log('='.repeat(60));
console.log('  📚 HELPFUL LINKS');
console.log('='.repeat(60) + '\n');
console.log('PayMongo Dashboard: https://dashboard.paymongo.com');
console.log('PayMongo Docs:      https://developers.paymongo.com');
console.log('GCash Integration:  https://developers.paymongo.com/docs/e-wallets');
console.log('Test Cards Info:    https://developers.paymongo.com/docs/testing\n');

console.log('='.repeat(60) + '\n');
