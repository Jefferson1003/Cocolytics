# ✅ Camera Scanner - Pre-Flight Checklist

## 🎯 Before You Start

Use this checklist to verify everything is ready before using the camera scanner.

---

## Step 1: System Requirements Check

- [ ] Windows 10 or later
- [ ] Python 3.8+ installed (`python --version`)
- [ ] Node.js 14+ installed (`node --version`)
- [ ] npm 6+ installed (`npm --version`)
- [ ] At least 4GB free RAM
- [ ] At least 2GB free disk space
- [ ] Camera / webcam connected and working
- [ ] MySQL/MariaDB running on port 3306

**Didn't pass? Installation help:**
```bash
# Check Python
python --version

# Check Node/npm
node --version
npm --version

# Check free disk space
dir C:\
```

---

## Step 2: Dependencies Installed

Navigate to `C:\COCOLYTICS\Cocolytics` and run:

```bash
# Backend dependencies
cd backend && npm install && cd ..

# ML Service dependencies  
cd ml-service && pip install -r requirements.txt && cd ..

# Frontend dependencies
cd frontend && npm install && cd ..
```

Check:
- [ ] No errors during `npm install` (ignore warnings)
- [ ] No errors during `pip install` 
- [ ] `node_modules/` folders exist in backend and frontend
- [ ] Python packages installed (can take 5-10 min for TensorFlow)

---

## Step 3: Database Check

```bash
# Open MySQL/MariaDB client
mysql -u root

# In MySQL prompt, run:
USE cocolytics;
SHOW TABLES;
```

Check:
- [ ] Can connect to MySQL without password error
- [ ] `cocolytics` database exists
- [ ] Tables exist (users, conversations, chat_messages, etc.)

**If database missing:**
```bash
cd backend
node init-db.js
```

---

## Step 4: Port Availability

Make sure ports are NOT in use:

```powershell
# Check what's using each port
netstat -ano | find ":3000"     # Should be empty
netstat -ano | find ":5000"     # Should be empty
netstat -ano | find ":5173"     # Should be empty
netstat -ano | find ":3306"     # Should show MySQL
```

Check:
- [ ] Port 3000 is free (or MySQL is using it)
- [ ] Port 5000 is free
- [ ] Port 5173 is free
- [ ] Port 3306 shows MySQL is running

**If ports in use, kill them:**
```powershell
# Find process using port 3000
Get-Process | Where-Object {$_.ProcessName -like "node"} | Stop-Process -Force

# Find process using port 5000
Get-Process | Where-Object {$_.ProcessName -like "python"} | Stop-Process -Force
```

---

## Step 5: Start All Services

From `C:\COCOLYTICS\Cocolytics`, run:

```bash
START_ALL.bat
```

Or manually in 3 separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend && node server.js
```
Expected output:
```
✅ Server running on port 3000
✅ Database connection pool created
✅ Chat system tables initialized
```

**Terminal 2 - ML Service:**
```bash
cd ml-service && python app.py
```
Expected output:
```
🌴 Cocolumber ML Detection Service Starting...
📡 Server running on http://localhost:5000
✅ Ready to detect coconut lumber!
```

**Terminal 3 - Frontend:**
```bash
cd frontend && npm run dev
```
Expected output:
```
VITE v5.0.0 ready in XXX ms
➜ Local: http://localhost:5173
```

Check:
- [ ] Backend started without errors
- [ ] ML Service started without errors
- [ ] Frontend dev server started without errors
- [ ] All 3 services show ready messages
- [ ] Wait at least 10 seconds before using

---

## Step 6: Verify Services Are Running

Test each service:

```bash
# Test Backend Health
curl http://localhost:3000

# Test ML Service Health
curl http://localhost:5000/health
# Expected: {"status": "healthy", "service": "ML Detection Service"}
```

Check:
- [ ] Backend responds (any response is good)
- [ ] ML Service returns: `{"status": "healthy"...}`
- [ ] No "Connection refused" errors

---

## Step 7: Frontend & Login

Open browser and go to:
```
http://localhost:5173
```

- [ ] Page loads without errors
- [ ] See login form
- [ ] Can login with staff account credentials
- [ ] Redirects to dashboard

---

## Step 8: Navigate to Camera Scanner

After login:

- [ ] Can see sidebar on left
- [ ] Can click **📹 Camera Scanner** in sidebar
- [ ] Camera scanner page loads
- [ ] See "📹 Real-time Camera" tab
- [ ] See "📁 Upload Image" tab

---

## Step 9: Test Camera Access

Click **🎥 Start Camera** when on Camera Scanner page:

- [ ] Browser asks permission to access camera
- [ ] Click "Allow" to grant camera permission
- [ ] Camera preview shows your camera feed
- [ ] See buttons: 🟢 Start Detection, ⏹️ Stop Camera, 📸 Capture

**If camera doesn't show:**
- Check browser camera permission in settings
- Try different browser (Chrome, Edge, Firefox)
- Try re-plugging camera
- Restart browser

---

## Step 10: Test Detection (Simulation)

### First Test - Not ML (Just to verify flow)

1. Click 📸 **Capture** (freeze current camera frame)
2. Click 🟢 **Start Detection**
3. Wait 2-3 seconds

Expected result:
```
🔍 Detection Results
├─ Tree Detected: Yes ✓  (or No ✗)
├─ Confidence: 85%
├─ Height: 9.2 m
├─ Diameter: 40 cm
├─ Est. Lumber: 88 board feet
└─ Quality: Grade A
```

- [ ] Response comes back within 10 seconds (first time slower)
- [ ] Shows results in "Detection Results" section
- [ ] No console errors (F12 to check)

---

## Step 11: Check Browser Console Logs

Press **F12** in browser to open Developer Tools:

Click **Console** tab and look for messages like:
```
Starting detection...
Captured Image: Available (245432 chars)
Using image data: Yes (245432 chars)
Sending to API: http://localhost:3000/api/staff/detect-cocolumber
Image size: 245432 bytes
Response status: 200
Detection result: {detectedClass: "cocolumber", ...}
```

Check:
- [ ] No red error messages
- [ ] See detection logs above
- [ ] Response status is 200 (success)

---

## Step 12: Check Backend Console

Switch to Terminal 1 (Backend):

Look for logs like:
```
🔍 Top predictions: ['tree', 'plant', 'forest']
📊 Confidence scores: [0.65, 0.12, 0.08]  
👤 Human detected: false
🌳 Wood detected: true
✅ ML Service response: {"detectedClass": "cocolumber", ...}
```

Check:
- [ ] Backend received request
- [ ] Backend forwarded to ML service
- [ ] Backend got response back
- [ ] No error messages (if error, check ML service)

---

## Step 13: Check ML Service Console

Switch to Terminal 2 (ML Service):

Look for messages like:
```
[2026-02-25 15:30:45] POST /predict
[2026-02-25 15:30:49] TensorFlow model loaded
[2026-02-25 15:30:50] Predictions: tree (0.65), plant (0.12), wood (0.08)
[2026-02-25 15:30:51] Classification: cocolumber detected
```

Check:
- [ ] ML service received request
- [ ] TensorFlow model loaded (first time: 5-10 sec warning)
- [ ] Predictions returned
- [ ] Classification complete

---

## ✅ All Checks Passed?

If everything above is checked ✓, you're ready to use the camera scanner!

```
🎉 Your Camera Scanner with ML Detection is READY! 🎉
```

---

## Proceeding Steps

1. **Basic Testing**
   - Aim camera at paper → Should say "Not detected"
   - Aim camera at plant → Should say "Tree/Wood detected"
   - Aim camera at yourself → Should say "Human detected"

2. **Production Use**
   - Use with real coconut lumber
   - See if measurements are reasonable
   - Adjust as needed

3. **Advanced**
   - Collect training data
   - Fine-tune ML model
   - Improve accuracy

---

## Still Having Issues?

Check these resources:
- 📖 `CAMERA_QUICK_START.md` - Quick reference
- 📚 `ML_SETUP_GUIDE.md` - Detailed setup
- 🔄 `CAMERA_SCANNER_FLOW.md` - How it all works
- 🐛 `ml-service/TROUBLESHOOTING.md` - Troubleshooting help
- 📋 Browser Console (F12) - Frontend errors
- 🖥️ Terminal outputs - Backend/ML errors

---

Ready to detect coconut lumber? Let's go! 🌴🎥
