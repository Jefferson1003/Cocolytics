# 🧪 GCash Test Mode Guide

## Your System is Ready to Test!

Your payment system is currently in **TEST MODE** which means:
- ✅ GCash QR codes will generate
- ✅ Payments will process (simulated)
- ✅ Orders will be created
- ❌ No real money is charged
- ❌ QR codes are for testing only

---

## How to Test GCash Payment (Right Now!)

### Step 1: Place an Order
1. Go to your marketplace: http://localhost:5173
2. Browse products
3. Add items to cart
4. Go to checkout

### Step 2: Select GCash Payment
1. Click "GCash" payment method
2. Click "Generate GCash QR Code"
3. A QR code will appear

### Step 3: Simulate Payment
Since you're in test mode:
- The QR code is generated but won't charge real money
- Click "Confirm Payment" to complete the test order
- Your order will be marked as "awaiting_payment"

---

## To Use REAL GCash Payments

### Get PayMongo API Keys (5 minutes):

1. **Sign up at PayMongo:**
   - Go to: https://dashboard.paymongo.com/signup
   - Enter your email and password
   - Verify your email

2. **Get Test Keys:**
   - Login to: https://dashboard.paymongo.com
   - Click "Developers" in sidebar
   - You'll see:
     - Public Key: `pk_test_xxxxxxxxxx`
     - Secret Key: `sk_test_xxxxxxxxxx`
   - Copy both keys

3. **Update Backend .env File:**
   ```
   Open: Cocolytics/backend/.env
   
   Replace these lines:
   PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
   PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here
   
   With your actual keys:
   PAYMONGO_PUBLIC_KEY=pk_test_AbCdEf123...
   PAYMONGO_SECRET_KEY=sk_test_XyZ789...
   ```

4. **Restart Backend:**
   ```
   Stop backend (Ctrl+C)
   cd Cocolytics/backend
   node server.js
   ```

5. **You should see:**
   ```
   ✅ PayMongo LIVE MODE - Using real API
   ```

---

## Test Credit Cards (For PayMongo Test Mode)

When using TEST keys, use these card numbers:

**✅ Successful Payment:**
- Card Number: `4120 0000 0000 0007`
- Expiry: `12/30` (any future date)
- CVC: `123`

**❌ Failed Payment (to test errors):**
- Card Number: `4120 0000 0000 0015`

---

## GCash Test Account

For REAL GCash testing with PayMongo test keys:
1. PayMongo provides a test GCash environment
2. Use amount: ₱100.00 for successful test
3. The payment will redirect to a test page

---

## Current Status

Check your backend terminal. You should see one of these:

```
⚠️  PayMongo TEST MODE - Using mock payment responses
```
This means you're in mock mode (no real payments)

```
✅ PayMongo LIVE MODE - Using real API
```
This means you've configured real keys (payments will work)

---

## Troubleshooting

### "Payment failed" error
- Check that backend is running
- Check console for errors
- Verify order exists in database

### QR Code doesn't generate
- Check frontend .env has same frontend URL
- Check CORS settings in backend
- Open browser console for errors

### Payment doesn't redirect back
- Check FRONTEND_URL in backend/.env
- Should match your actual frontend URL: http://192.168.68.101:5173

---

## Need Real Production GCash?

For LIVE production payments:
1. Complete PayMongo KYC verification
2. Get LIVE keys (pk_live_..., sk_live_...)
3. Update .env with live keys
4. Test with small amounts first!

---

## Questions?

- PayMongo Docs: https://developers.paymongo.com
- GCash Integration: https://developers.paymongo.com/docs/e-wallets
- Support: support@paymongo.com
