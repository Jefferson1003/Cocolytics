# 🔐 Cocolytics Login Credentials

## ⚠️ IMPORTANT: Backend Must Be Running!
Before logging in, ensure the backend server is running on port 3000.

**Start backend:**
```bash
cd c:\COCOLYTICS\Cocolytics\backend
node server.js
```

---

## 👥 All Working Login Accounts

### 1. 👑 Admin Account
```
Email: admin@gmail.com
Password: admin123
Role: Admin
Access: Full system admin dashboard
```

### 2. 👷 Staff Accounts

**Staff User (General)**
```
Email: staff@gmail.com
Password: staff123
Role: Staff
Access: Staff dashboard, inventory, reports
```

**Vina's Store**
```
Email: vina@cocolytics.com
Password: Staff123
Role: Staff
Store: Vina Store
Access: Store management, products
```

**Paolo's Store**
```
Email: paolo@cocolytics.com
Password: Staff123
Role: Staff
Store: Paolo Store
Access: Store management, products
```

**Bala's Store**
```
Email: bala@cocolytics.com
Password: Staff123
Role: Staff
Store: Bala Store
Access: Store management, products
```

### 3. 👤 Regular User Accounts

**BULILIT**
```
Email: jeffbala@gmail.com
Password: 123456
Role: User
Access: Marketplace, orders, chat
```

**Regular User**
```
Email: user@gmail.com
Password: user123
Role: User
Access: Marketplace, orders, chat
```

**Pao** (Custom password - contact user)
```
Email: rubiojp05@gmail.com
Password: (User set their own password)
Role: User
Access: Marketplace, orders, chat
```

---

## 🚀 Quick Login Test

**To test if backend is working:**
1. Open: http://localhost:5173/login
2. Try admin login:
   - Email: `admin@gmail.com`
   - Password: `admin123`
3. If successful, you'll see the admin dashboard

---

## ❌ Common Login Issues

### Issue: "Login Failed" Error

**Solution:**
1. ✅ Backend server must be running on port 3000
   ```bash
   cd c:\COCOLYTICS\Cocolytics\backend
   node server.js
   ```

2. ✅ Check if backend is responding:
   ```bash
   curl http://localhost:3000/api/users
   ```

3. ✅ Password is **case-sensitive**:
   - ❌ Wrong: `Admin123` (for admin@gmail.com)
   - ✅ Correct: `admin123` (lowercase)

4. ✅ Make sure frontend can reach backend
   - Frontend should be on http://localhost:5173
   - Backend should be on http://localhost:3000

---

## 🔄 Reset All Passwords (If Needed)

If you want to reset all passwords to a common one, run this:

```bash
cd c:\COCOLYTICS\Cocolytics\backend
node generate-staff-passwords.js
```

---

## 📝 Password Notes

- **Lowercase passwords:** `admin123`, `staff123`, `user123`, `123456`
- **Capital S passwords:** `Staff123` (for Vina, Paolo, Bala)
- **Case matters!** `Staff123` ≠ `staff123`

---

## 🆘 Still Can't Login?

Run this test script:
```bash
cd c:\COCOLYTICS\Cocolytics\backend
node test-passwords.js
```

This will show you the exact working password for each account.

---

**Last Updated:** February 28, 2026
**Total Accounts:** 8 users (1 admin, 4 staff, 3 regular users)
