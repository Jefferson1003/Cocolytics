# 🚀 Setup Cocolytics on New Laptop

## Prerequisites
- **Node.js** (v14 or higher)
- **MySQL** (v8.0 or higher)
- **Python** (v3.8 or higher)
- **Git**

---

## 📥 Step 1: Clone the Repository

```bash
git clone https://github.com/Jefferson1003/Cocolytics.git
cd Cocolytics
```

---

## 🗄️ Step 2: Setup Database

1. **Open MySQL Command Line or phpMyAdmin**

2. **Import the complete database:**
   ```bash
   mysql -u root -p < COMPLETE_DATABASE.sql
   ```
   
   Or in MySQL CLI:
   ```sql
   source COMPLETE_DATABASE.sql
   ```

3. **Verify database created:**
   ```sql
   USE cocolytics;
   SHOW TABLES;
   ```
   
   You should see 22 tables.

---

## 🔧 Step 3: Backend Setup

```bash
cd backend
npm install
```

**Create `.env` file in backend folder:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cocolytics
JWT_SECRET=your_secret_key_here
PORT=3000
```

**Start backend server:**
```bash
node server.js
```

Should show: `✅ Server running on http://localhost:3000`

---

## 🎨 Step 4: Frontend Setup

```bash
cd ../frontend
npm install
```

**Start frontend dev server:**
```bash
npm run dev
```

Should show: `➜ Local: http://localhost:5173/`

---

## 🤖 Step 5: ML Service Setup

```bash
cd ../ml-service
python -m venv venv
venv\Scripts\activate     # Windows
# source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

**Start ML service:**
```bash
python app.py
```

Should show: `✅ ML Service running on http://localhost:5000`

---

## 🚀 Quick Start (All Services at Once)

**Windows:**
```bash
START_ALL.bat
```

**Or PowerShell:**
```powershell
.\START_ALL.ps1
```

---

## 📱 Access from Phone/Network

The app is configured for network access. Once running:

1. Find your laptop's IP address:
   ```bash
   ipconfig    # Windows
   ifconfig    # Mac/Linux
   ```

2. Access from any device on the same network:
   ```
   http://YOUR_IP_ADDRESS:5173/
   ```

Example: `http://192.168.1.100:5173/`

---

## 👥 Default Login Credentials

### Admin Account
- Email: `admin@gmail.com`
- Password: `Staff123`

### Staff Accounts
- **Vina:** `vina@cocolytics.com` / `Staff123`
- **Paolo:** `paolo@cocolytics.com` / `Staff123`
- **Bala:** `bala@cocolytics.com` / `Staff123`

### Regular User
- Email: `user@gmail.com`
- Password: `Staff123`

---

## 📊 Database Structure

The `COMPLETE_DATABASE.sql` file includes:

### Core Tables (22 tables)
- **users** - Authentication & roles
- **staff_profiles** - Multi-seller stores
- **cocolumber_logs** - Product inventory
- **orders** - Order management with payment & shipping
- **order_history** - Order audit trail
- **paper_uploads** - Document approvals

### Chat System (3 tables)
- **chat_conversations** - Conversation threads
- **conversation_participants** - User participation
- **chat_messages** - Message content

### Notifications (4 tables)
- **notifications** - Alert messages
- **alert_rules** - Alert configuration
- **drying_logs** - Process tracking
- **notification_preferences** - User settings

### Payment System (3 tables)
- **payments** - PayMongo transactions
- **payment_logs** - Payment audit trail
- **refunds** - Refund management

### Shipping (2 tables)
- **shipment_tracking** - Shipment status
- **courier_updates** - Delivery tracking

### Views (3 views)
- **order_summary** - Complete order details
- **order_status_summary** - Status aggregation
- **staff_store_summary** - Store statistics

---

## ✅ Verify Setup

1. **Backend:** http://localhost:3000/api/health
2. **Frontend:** http://localhost:5173/
3. **ML Service:** http://localhost:5000/

---

## 🔥 Features Included

✅ Multi-seller marketplace (3 staff stores)  
✅ Real-time trader chat with notifications  
✅ Brown cocolumber detection (ML)  
✅ Camera scanner with measurements  
✅ Payment integration (PayMongo ready)  
✅ Order tracking & shipping  
✅ Admin dashboard (mobile-responsive)  
✅ Notification system with alerts  
✅ Paper approval workflow  

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database `cocolytics` exists

### ML Service Python Errors
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 📚 Additional Documentation

- **ML Setup:** `ML_SETUP_GUIDE.md`
- **Chat System:** `CHAT_FEATURES_GUIDE.md`
- **Brown Detection:** `BROWN_DETECTION_COMPLETE_GUIDE.md`
- **Mobile Access:** `MOBILE_QUICK_START.md`
- **Payment Setup:** `PAYMONGO_SETUP.md`

---

## 🔄 Keep Updated

To pull latest changes from GitHub:
```bash
git pull origin main
```

---

**Need help?** Check the documentation files or contact the development team.
