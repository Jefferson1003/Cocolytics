# 🔑 PayMongo API Keys Setup - REQUIRED FIX

## Problem
Your GCash payment shows:
- ❌ Automatically marks as "paid" without authorization
- ❌ No real QR code generation
- ❌ No actual payment processing

**Root Cause:** PayMongo API keys are placeholder values, so the system runs in TEST MODE.

---

## ✅ Solution: Get Real PayMongo Keys (5 minutes)

### Step 1: Sign Up at PayMongo
1. Go to: https://dashboard.paymongo.com/signup
2. Enter your email and password
3. Check your email for verification link
4. Click the link to verify your email

### Step 2: Get Your API Keys
1. Log in to: https://dashboard.paymongo.com
2. Click **"Developers"** in the left sidebar
3. You'll see two keys:
   - **Public Key:** `pk_test_xxxxxxxxxx` (for frontend)
   - **Secret Key:** `sk_test_xxxxxxxxxx` (for backend)
4. Copy both keys

### Step 3: Update Backend .env File
1. Open: `Cocolytics/backend/.env`
2. Find these lines:
   ```
   PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
   PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here
   ```
3. Replace with your actual keys:
   ```
   PAYMONGO_PUBLIC_KEY=pk_test_XXXXXXXXXXXXXX
   PAYMONGO_SECRET_KEY=sk_test_XXXXXXXXXXXXXX
   ```
4. **Save the file** (Ctrl+S)

### Step 4: Restart Backend
1. Stop your backend (Ctrl+C if running in terminal)
2. In terminal, run:
   ```
   cd Cocolytics/backend
   node server.js
   ```
3. You should see:
   ```
   ✅ PayMongo LIVE MODE - Using real API
   ```

---

## ✅ Test Your GCash Payment

### Now it will work correctly:
1. Go to http://localhost:5173
2. Add items to cart
3. Go to checkout
4. Select **GCash** payment
5. Click **"Generate GCash QR Code"** 
6. ✅ Real QR code will appear
7. Scan with GCash app
8. ✅ Real authorization page appears
9. ✅ After payment, order marks as "paid"

---

## 📝 Test Payment Data (PayMongo Test Mode)

When using test keys, you can simulate payments:

**✅ Successful Payment:**
- Card Number: `4120 0000 0000 0007`
- Expiry: `12/30`
- CVC: `123`

**❌ Failed Payment (test errors):**
- Card Number: `4120 0000 0000 0015`

**For GCash Test:**
- Amount: ₱100.00
- You'll see a test authorization page

---

## ⚠️ Important Notes

### Test Mode vs Live Mode
- **Test Mode** (current): Uses `pk_test_` and `sk_test_` keys
  - No real charges
  - Good for development
  
- **Live Mode** (later): Uses `pk_live_` and `sk_live_` keys
  - Real charges
  - For production use

### Security
✅ **Safe to share test keys** (they don't charge real money)
❌ **NEVER share live keys** (they can charge real credit cards)

---

## 🆘 Troubleshooting

### Still in TEST MODE after restart?
- Check if .env file was saved
- Check backend console for the startup message
- Verify keys don't have extra spaces

### QR Code still not appearing?
- Refresh your browser (Ctrl+F5)
- Clear browser cache
- Try different browser

### Still having issues?
- Check backend console for errors
- Make sure backend is running on http://localhost:3000
- Verify API base URL in frontend .env

---

## ✅ What You'll Get
✅ Real GCash QR codes
✅ Real authorization flow
✅ Proper payment confirmation
✅ Correct order status updates
