# 🔑 PayMongo Keys - Copy & Paste Template

## 🚀 Quick Setup (Copy-Paste Ready)

### Step 1: Get Your Keys from PayMongo

1. Go to: https://dashboard.paymongo.com/developers
2. You'll see something like:
   ```
   Public Key: pk_test_XXXXXXXXXXXXXX
   Secret Key: sk_test_XXXXXXXXXXXXXX
   ```

### Step 2: Copy Your Exact Keys

Replace these examples with your ACTUAL keys from PayMongo:

**Example Format:**
```
Public Key:  pk_test_AbCdEfGhIjKlMnOpQRStUvWxYz
Secret Key:  sk_test_XyZ9876543210aBcDeFgHiJkLmN
```

---

## ✏️ Update Your .env File

### File: `Cocolytics/backend/.env`

**FIND THIS:**
```
PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here
```

**REPLACE WITH THIS (using YOUR actual keys):**
```
PAYMONGO_PUBLIC_KEY=pk_test_TBD_REPLACE_WITH_YOUR_KEY
PAYMONGO_SECRET_KEY=sk_test_TBD_REPLACE_WITH_YOUR_KEY
```

**EXACT EXAMPLE (If your PayMongo shows):**
```
Public Key:   pk_test_5k7J8mQw9pR2tUvWxYz3aBcDeFg
Secret Key:   sk_test_HiJkLmNoPqRsTuVwXyZ1aBcDeFgHiJ
```

**Then update .env to:**
```
PAYMONGO_PUBLIC_KEY=pk_test_5k7J8mQw9pR2tUvWxYz3aBcDeFg
PAYMONGO_SECRET_KEY=sk_test_HiJkLmNoPqRsTuVwXyZ1aBcDeFgHiJ
```

---

## 📋 How to Get Real Keys (5 Minutes)

### Option A: Test Keys (RECOMMENDED FOR NOW)
Test keys allow real payment testing without real charges.

1. Go to: https://dashboard.paymongo.com
2. Click: "Developers" (left sidebar)
3. You'll see **two keys**:
   - **pk_test_XXXX...** (Public key - for frontend)
   - **sk_test_XXXX...** (Secret key - for backend)
4. Copy both
5. Paste into your `.env` file

### Option B: Sign Up for New Account
If you don't have an account:

1. Go to: https://dashboard.paymongo.com/signup
2. Enter email and password
3. Check email for verification link
4. Click link to activate
5. Login and go to "Developers"
6. Follow steps from Option A

---

## ✅ Verification After Update

After updating `.env`, restart backend:

```powershell
cd Cocolytics/backend
node server.js
```

**You should see in console:**
```
✅ PayMongo LIVE MODE - Using real API connections
📊 GCash QR codes will be generated
💳 Real payment authorization required
```

If you still see:
```
⚠️  PayMongo TEST MODE - Using mock payment responses
```

This means:
- ❌ .env file wasn't saved properly
- ❌ Keys have extra spaces
- ❌ Backend wasn't restarted
- ❌ Terminal was closed/restarted

---

## 🔒 Security Note

### ✅ SAFE to Share:
- **pk_test_XXX** (public test keys)
- **sk_test_XXX** (secret test keys)
- These cannot charge real money

### ❌ NEVER Share:
- **pk_live_XXX** (public live keys)
- **sk_live_XXX** (secret live keys)
- These CAN charge real credit cards

---

## 📍 Key Information

| Item | Where to Find | Format |
|------|--------------|--------|
| Public Key | PayMongo Developers | `pk_test_...` or `pk_live_...` |
| Secret Key | PayMongo Developers | `sk_test_...` or `sk_live_...` |
| Dashboard | https://dashboard.paymongo.com | Web interface |
| Developers | Click "Developers" in sidebar | Shows your keys |

---

## 🆘 Troubleshooting

### "Still getting TEST MODE warning"

Try these steps in order:

1. **Close VS Code completely**
2. **Reopen it**
3. **Open `Cocolytics/backend/.env`**
4. **Verify keys are there** (use Find: Ctrl+F)
5. **Check for extra spaces** (especially at end of lines)
6. **Save file** (Ctrl+S)
7. **Stop backend** (Ctrl+C)
8. **Clear terminal** (type `clear` or `cls`)
9. **Restart backend:**
   ```
   cd Cocolytics/backend
   node server.js
   ```

### "Keys aren't working"

1. Copy keys again from PayMongo dashboard
2. Make sure you're copying from the **Developers** section
3. Verify keys start with `pk_test_` and `sk_test_`
4. Check for extra spaces before/after keys
5. Save .env file
6. Restart backend

### "PayMongo dashboard won't load"

1. Try incognito/private window
2. Try different browser
3. Try clearing browser cache
4. Contact PayMongo support: support@paymongo.com

---

## ✨ Success Example

### Your .env BEFORE:
```
PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here
```

### Your .env AFTER (Example):
```
PAYMONGO_PUBLIC_KEY=pk_test_9k2L4m6N8p0Q2r4t6v8x0y2z4
PAYMONGO_SECRET_KEY=sk_test_5a7B9c1D3e5F7g9H1i3j5k7l9
```

### Backend Console Shows:
```
✅ PayMongo LIVE MODE - Using real API connections
📊 GCash QR codes will be generated
💳 Real payment authorization required
```

### Then in your app:
1. Click "Generate GCash QR Code" ✅
2. Real QR code appears ✅
3. Scan with GCash app ✅
4. Real authorization page shows ✅
5. Payment processes ✅
6. Order marked as "paid" ✅

