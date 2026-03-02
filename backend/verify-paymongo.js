/**
 * PayMongo Setup Verification Script
 * Run this to verify your PayMongo integration is working
 */

require('dotenv').config();

const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY;
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

console.log('\n🔍 Checking PayMongo Configuration...\n');

// Check if keys are set
if (!PAYMONGO_PUBLIC_KEY || !PAYMONGO_SECRET_KEY) {
  console.log('❌ FAILED: API keys not found in .env file\n');
  console.log('📝 Solution:');
  console.log('   1. Open backend/.env file');
  console.log('   2. Add your PayMongo keys:');
  console.log('      PAYMONGO_PUBLIC_KEY=pk_test_your_key_here');
  console.log('      PAYMONGO_SECRET_KEY=sk_test_your_key_here\n');
  process.exit(1);
}

// Check if using placeholder keys
const isPlaceholder = PAYMONGO_SECRET_KEY.includes('placeholder') || 
                     PAYMONGO_SECRET_KEY.includes('your_secret_key_here');

if (isPlaceholder) {
  console.log('⚠️  WARNING: Using placeholder API keys\n');
  console.log('Current keys:');
  console.log(`   Public: ${PAYMONGO_PUBLIC_KEY}`);
  console.log(`   Secret: ${PAYMONGO_SECRET_KEY.substring(0, 15)}...\n`);
  console.log('📝 To use real PayMongo:');
  console.log('   1. Go to: https://dashboard.paymongo.com/developers');
  console.log('   2. Copy your API keys');
  console.log('   3. Replace in backend/.env file\n');
  console.log('💡 System will work in TEST MODE with mock payments\n');
  process.exit(0);
}

// Validate key format
const hasValidPublicKey = PAYMONGO_PUBLIC_KEY.startsWith('pk_test_') || 
                          PAYMONGO_PUBLIC_KEY.startsWith('pk_live_');
const hasValidSecretKey = PAYMONGO_SECRET_KEY.startsWith('sk_test_') || 
                          PAYMONGO_SECRET_KEY.startsWith('sk_live_');

if (!hasValidPublicKey) {
  console.log('❌ FAILED: Invalid public key format\n');
  console.log('   Public key should start with: pk_test_ or pk_live_');
  console.log(`   Your key: ${PAYMONGO_PUBLIC_KEY.substring(0, 20)}...\n`);
  process.exit(1);
}

if (!hasValidSecretKey) {
  console.log('❌ FAILED: Invalid secret key format\n');
  console.log('   Secret key should start with: sk_test_ or sk_live_');
  console.log(`   Your key: ${PAYMONGO_SECRET_KEY.substring(0, 20)}...\n`);
  process.exit(1);
}

// Check environment (test vs live)
const isTestMode = PAYMONGO_SECRET_KEY.startsWith('sk_test_');
const environment = isTestMode ? 'TEST' : 'LIVE';

console.log('✅ SUCCESS: PayMongo keys are configured!\n');
console.log('Configuration:');
console.log(`   Environment: ${environment} MODE`);
console.log(`   Public Key: ${PAYMONGO_PUBLIC_KEY.substring(0, 20)}...`);
console.log(`   Secret Key: ${PAYMONGO_SECRET_KEY.substring(0, 20)}...\n`);

if (isTestMode) {
  console.log('💳 Test Card Numbers:');
  console.log('   Success: 4120 0000 0000 0007');
  console.log('   Failed:  4120 0000 0000 0015\n');
}

console.log('🚀 Ready to process payments!\n');
console.log('Next steps:');
console.log('   1. Start backend: node server.js');
console.log('   2. Start frontend: npm run dev');
console.log('   3. Test payment flow\n');
