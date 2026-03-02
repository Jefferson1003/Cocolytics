# 🚀 PayMongo Quick Setup - 3 Steps to Get Working

## ⚡ Step 1: Get Your PayMongo Keys (5 minutes)

### Option A: Use Test Keys (For Testing)
1. Go to: **https://dashboard.paymongo.com/signup**
2. Sign up with email
3. Skip KYC verification (for test mode)
4. Go to **Developers** tab
5. Copy your **Test Keys**:
   - `pk_test_...` (Public Key)
   - `sk_test_...` (Secret Key)

### Option B: Use Live Keys (For Production)
1. Complete KYC verification in PayMongo
2. Get approved
3. Copy your **Live Keys**:
   - `pk_live_...` 
   - `sk_live_...`

---

## ⚙️ Step 2: Update Your .env File

Open `backend/.env` and replace these lines:

```env
PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here
```

**With your actual keys from Step 1:**

```env
PAYMONGO_PUBLIC_KEY=pk_test_AbCdEf1234567890
PAYMONGO_SECRET_KEY=sk_test_XyZaBc0987654321
```

⚠️ **Important:** No spaces, copy exactly as shown in PayMongo dashboard!

---

## 🔄 Step 3: Restart Backend

Open terminal in backend folder:

```bash
cd Cocolytics/backend
node server.js
```

**Look for this message:**
```
✅ PayMongo LIVE MODE - Using real API
```

✅ **SUCCESS!** PayMongo is now working!

If you see:
```
⚠️ PayMongo TEST MODE - Using mock payment responses
```
❌ Keys are not set up correctly. Go back to Step 2.

---

## 🧪 Testing Your Setup

### Test GCash Payment:
1. Go to cart/checkout
2. Select **GCash** payment
3. Click **"Generate GCash QR Code"**
4. **QR Code should appear** ✅
5. Scan with GCash app
6. Complete payment

### Test PayMaya Payment:
1. Select **PayMaya** payment
2. Enter email address
3. Click **"Pay with PayMaya"**
4. **Redirects to PayMaya** ✅
5. Complete payment

---

## 🎯 Payment Test Card Numbers

When using **Test Keys**, use these card numbers:

**✅ Successful Payment:**
- Card: `4120 0000 0000 0007`
- Expiry: `12/25` (any future date)
- CVC: `123` (any 3 digits)

**❌ Failed Payment (for testing errors):**
- Card: `4120 0000 0000 0015`

---

## 🔧 Common Issues & Fixes

### Issue: "Failed to create payment link"
**Fix:**
1. Check your API keys have no spaces
2. Make sure keys start with `pk_test_` and `sk_test_`
3. Restart backend server after updating .env

### Issue: No QR Code appears
**Fix:**
1. Open browser console (F12)
2. Check for errors
3. Verify npm packages installed: `cd frontend && npm install`
4. Clear browser cache

### Issue: Payment not showing in PayMongo dashboard
**Fix:**
1. Make sure you're using correct keys (test vs live)
2. Wait a few minutes for dashboard to update
3. Check "Payments" tab in PayMongo dashboard

---

## 📞 Need Help?

- **PayMongo Support:** support@paymongo.com
- **Documentation:** https://developers.paymongo.com/docs
- **API Reference:** https://developers.paymongo.com/reference

---

## ✅ Verification Checklist

After setup, verify these work:

- [ ] Backend shows "✅ PayMongo LIVE MODE"
- [ ] GCash QR code generates when clicked
- [ ] PayMaya redirects to payment page
- [ ] Test payment appears in PayMongo dashboard
- [ ] Order status updates after payment

**All checked?** You're ready to accept payments! 🎉
