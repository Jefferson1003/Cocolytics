# ✅ GCash Fix Checklist

## Status: 🔴 NOT COMPLETE - Needs PayMongo Keys

---

## 📋 Quick Setup (10 minutes)

### ☐ Step 1: Get PayMongo Account
- [ ] Go to https://dashboard.paymongo.com/signup
- [ ] Create account (or login if you have one)
- [ ] Verify email
- [ ] Go to "Developers" section
- [ ] Copy your **Public Key** (pk_test_...)
- [ ] Copy your **Secret Key** (sk_test_...)

### ☐ Step 2: Update Backend Configuration
- [ ] Open file: `Cocolytics/backend/.env`
- [ ] Find: `PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here`
- [ ] Find: `PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here`
- [ ] Replace with your ACTUAL keys from PayMongo
- [ ] **Save file** (Ctrl+S)

### ☐ Step 3: Restart Backend
- [ ] Stop backend server (Ctrl+C)
- [ ] Run: `cd Cocolytics/backend`
- [ ] Run: `node server.js`
- [ ] Check console - should show: ✅ PayMongo LIVE MODE

### ☐ Step 4: Test Payment
- [ ] Open http://localhost:5173
- [ ] Add items to cart
- [ ] Go to checkout
- [ ] Select GCash payment
- [ ] Click "Generate GCash QR Code"
- [ ] Verify real QR code appears ✅

---

## 🔧 Code Changes Applied

### ✅ Fix #1: Payment Status Flow
**File:** `backend/routes/payment.js`
- Changed: Payment status always starts as "pending"
- Changed: Order status set to "awaiting_payment_confirmation"
- Result: Only webhook can mark as "paid" after real payment

### ✅ Fix #2: Failed Payment Handling
**File:** `backend/routes/payment.js`  
- Changed: Failed payments now update order status
- Added: payment_failed status for failed orders
- Result: Better order tracking

### ✅ Fix #3: Better Logging
**File:** `backend/services/paymongoService.js`
- Changed: Clearer messages when switching to LIVE MODE
- Added: Status indicators for real payment processing
- Result: Easier debugging

---

## 🎯 What Should Happen

### Before Fix (Current Issue):
```
❌ Payment source created (mock)
❌ Payment created (mock)  
❌ Order immediately marked "paid"
❌ No real authorization
❌ No real QR code
```

### After Fix (Correct Flow):
```
✅ User clicks "Generate GCash QR Code"
✅ Real PayMongo QR code generated
✅ Order status: "awaiting_payment_confirmation"
✅ User scans QR with GCash app
✅ GCash authorization page appears
✅ User authorizes payment
✅ PayMongo sends webhook: "payment.paid"
✅ Order status: "paid"
```

---

## 📞 Need Help?

### Backend won't restart?
```
cd Cocolytics/backend
node server.js
```
Check for error messages about PayMongo keys.

### Still in TEST MODE?
1. Verify .env file was saved
2. Check for extra spaces in keys
3. Restart terminal
4. Restart backend

### QR code not appearing?
1. Refresh browser (Ctrl+F5)
2. Clear cache
3. Check browser console for errors
4. Check backend logs

---

## 📊 Test Credentials

**Once PayMongo keys are added, use these to test:**

**✅ Successful Payment:**
- Amount: ₱100.00+
- Card: 4120 0000 0000 0007
- Expiry: 12/30
- CVC: 123

**❌ Failed Payment:**
- Card: 4120 0000 0000 0015

---

## 🎉 Success Indicators

- [ ] Backend shows: "✅ PayMongo LIVE MODE"
- [ ] No TES MODE warnings in console
- [ ] QR code generates when clicked
- [ ] GCash app can scan QR
- [ ] Payment required to proceed
- [ ] Order only marks "paid" after real payment

