# 🚀 CAMERA SCANNER - QUICK START GUIDE

## ⚡ Fastest Way to Get Started (30 seconds)

### Step 1: Open Terminal in Cocolytics folder
```bash
cd C:\COCOLYTICS\Cocolytics
```

### Step 2: Run startup script
```bash
START_ALL.bat
```

### Step 3: Wait 15-20 seconds for all services to start

### Step 4: Open browser
```
http://localhost:5173
```

### Step 5: Login and test
- Login with your staff account
- Click sidebar: 📹 **Camera Scanner**
- Click 🎥 **Start Camera**
- Aim at any object (paper, plant, person)
- Click 🟢 **Start Detection**
- Click 📸 **Capture**
- See results instantly!

---

## ✅ What Should Happen

### ✓ Services Start Successfully
```
[Terminal 1] Backend running on http://localhost:3000 ✓
[Terminal 2] ML Service running on http://localhost:5000 ✓  
[Terminal 3] Frontend running on http://localhost:5173 ✓
```

### ✓ First Detection Takes 6-12 seconds
- First time loads the ML model
- Be patient, it's initializing TensorFlow

### ✓ Subsequent Detections Are Fast (< 1 second)
- Model is cached in memory
- All following detections use cached model

### ✓ Results Display
```
🔍 Detection Results
├─ Tree Detected: Yes ✓
├─ Confidence: 85%
├─ Height: 9.2 m
├─ Diameter: 40 cm
├─ Est. Lumber: 88 board feet
└─ Quality: Grade A
```

---

## 🐛 Troubleshooting (Quick Fixes)

### Issue: "ML Service Unavailable"
**Fix:** Restart ML service terminal
```bash
cd ml-service
python app.py
```

### Issue: "Connection Failed"
**Fix:** Make sure all 3 services are running
```bash
# Check ports are in use:
netstat -ano | find "3000"  # Backend
netstat -ano | find "5000"  # ML
netstat -ano | find "5173"  # Frontend
```

### Issue: "No Image to Analyze"  
**Fix:** Try upload tab instead
- Click 📁 **Upload Image** tab
- Select any JPG/PNG file
- Click 🟢 **Start Detection**

### Issue: First detection hangs (>30 seconds)
**Fix:** Check ML service is running
- Go to http://localhost:5000 in browser
- Should see "{"status": "healthy"...}" 
- If not, run `python ml-service/app.py`

### Issue: Port already in use (Address already in use)
**Fix:** Kill existing process
```powershell
# Port 3000
taskkill /F /IM node.exe

# Port 5000  
Get-Process python | Stop-Process -Force

# Port 5173
taskkill /F /IM node.exe
```

---

## 📊 What Gets Detected

### ✅ Correctly Detected
- 🌳 Trees
- 🪵 Wood/Lumber  
- 🌴 Coconut trees
- 📦 Wooden planks
- 🪚 Wood logs
- 🌿 Plants with large stems

### ⚠️ Might Detect (with info)
- 🧑 People (shows warning)
- 📋 Paper/documents
- 🎨 Paintings/artworks

### ❌ Won't Detect
- 🚗 Cars
- 📱 Phones
- 🪑 Chairs (unless wooden)
- 🎮 Electronics
- 🍕 Food

---

## 📱 Mobile Usage

### iOS/Android Phone
1. Connect to same WiFi as computer
2. Open: `http://192.168.x.x:5173` (your PC IP)
3. Login
4. Use camera directly!

### Find Your PC IP
```bash
# Windows
ipconfig | find "IPv4"

# Result: IPv4 Address . . . . . . . . . . . : 192.168.1.100
# Use: http://192.168.1.100:5173
```

---

## 🔑 Key Features

| Feature | How To | Result |
|---------|--------|--------|
| 📸 **Capture** | Click 📸 Capture button | Freezes camera frame |
| 🔄 **Retake** | Click 🔄 Retake | Goes back to camera |
| 💾 **Save** | Click 💾 Save | Downloads image |
| 📁 **Upload** | Click 📁 Upload tab | Scan from file |
| 🟢 **Detect** | Click 🟢 Start Detection | Runs ML analysis |
| 📊 **Results** | Automatic display | Shows measurements |
| ➡️ **Switch Camera** | Dropdown: Front/Back | Changes to front camera |

---

## 🎯 Expected Measurements

For a **typical coconut tree/lumber**:
- Height: 8-15 meters
- Diameter: 30-80 cm
- Volume: 50-200 board feet
- Quality: Grade A/B/Premium

**Note:** These are estimates. Actual measurements depend on:
- Camera angle
- Distance from object
- Lighting conditions
- Tree uniformity

---

## 📈 Performance Tips

### For Better/Faster Detection
1. ✓ Good lighting (daylight best)
2. ✓ Clear angle of entire tree
3. ✓ 1-3 meters away
4. ✓ Focus camera properly
5. ✓ Keep device steady

### For Better Accuracy
1. ✓ Capture front-on angle
2. ✓ Avoid shadows/backlighting
3. ✓ Multiple captures of same tree
4. ✓ Use for relative sizing (not absolute)

---

## 🔗 System Architecture

```
User Device (Browser)
      ↓ (Image captured/uploaded)
Frontend Vue.js
      ↓ (POST /api/staff/detect-cocolumber)
Backend Node.js + Express
      ↓ (Forward to ML)
ML Service Python + TensorFlow
      ↓ (Process image + ML inference)
TensorFlow MobileNetV2
      ↓ (Return predictions)
Backend
      ↓ (Return results to frontend)
Frontend
      ↓ (Display to user)
User Views Results ✓
```

---

## 📚 More Information

- 📖 **Full Setup Guide**: `ML_SETUP_GUIDE.md`
- 🔄 **Complete Architecture**: `CAMERA_SCANNER_FLOW.md`
- ⚙️ **ML Technical Details**: `ml-service/README.md`
- 🐛 **Debug Help**: `ml-service/TROUBLESHOOTING.md`

---

## 💡 Pro Tips

1. **First Run is Always Slow**: ML model (~13MB) loads from disk (5-10 sec)
2. **All Subsequent Runs Are Fast**: Model cached in memory (<1 sec)
3. **If Something Hangs**: Press Ctrl+C to stop, restart service
4. **Check Logs If Error**: Each service logs details when issues occur
5. **Mobile Works Great**: No special setup needed!

---

## ✨ You're Ready!

Your camera scanner with ML object detection is now live! 🎉

```
🌴 Start Services → 🎥 Open Camera → 📸 Capture → 🔍 Detect → 📊 Results
```

Press START_ALL.bat and get detecting! 🚀
