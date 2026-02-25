# 📸 Camera Scanner - ML Object Detection Setup

## What It Does
Your camera scanner uses AI/ML to detect **coconut lumber (cocolumber)** and estimate measurements like:
- Height of the tree
- Diameter of the trunk
- Estimated lumber volume (in board feet)
- Quality grade (Premium/Grade A/Grade B)

## How It Works

### 1️⃣ **Frontend (Vue.js)** - CameraScanner.vue
- User opens camera and captures an image
- Sends Base64 image to backend API

### 2️⃣ **Backend (Node.js)** - /api/staff/detect-cocolumber
- Receives image from frontend
- Forwards to ML service on port 5000

### 3️⃣ **ML Service (Python)** - Flask API on port 5000
- Receives image
- Uses TensorFlow MobileNetV2 for object recognition
- Detects if it's:
  - 🧑 **Human** → Rejects (safety feature)
  - 🌳 **Coconut/Wood/Tree** → Analyzes and measures
  - 🚗 **Other objects** → Rejects
- Returns detection results with confidence score

### 4️⃣ **Results Display** - Back to Frontend
- Shows detected class (cocolumber/human/not found)
- If cocolumber: displays height, diameter, volume, quality

## 🚀 Startup Instructions

### Option A: Manual Start (3 Terminals)

**Terminal 1 - MySQL Database:**
```bash
# Make sure MySQL is running on port 3306
# Windows: Open Services and start MySQL80
# Or use: mysqld --console
```

**Terminal 2 - Node.js Backend:**
```bash
cd C:\COCOLYTICS\Cocolytics\backend
npm install
node server.js
# Runs on http://localhost:3000
```

**Terminal 3 - Python ML Service:**
```bash
cd C:\COCOLYTICS\Cocolytics\ml-service
python -m pip install -r requirements.txt  # First time only
python app.py
# Runs on http://localhost:5000
```

**Terminal 4 - Vue.js Frontend:**
```bash
cd C:\COCOLYTICS\Cocolytics\frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Option B: All in One (Windows PowerShell)
```powershell
# Run all services in parallel
Start-Process powershell -ArgumentList "-Command cd C:\COCOLYTICS\Cocolytics\backend; npm install; node server.js"
Start-Process powershell -ArgumentList "-Command cd C:\COCOLYTICS\Cocolytics\ml-service; python -m pip install -r requirements.txt; python app.py"
Start-Process powershell -ArgumentList "-Command cd C:\COCOLYTICS\Cocolytics\frontend; npm run dev"
```

## 🔍 Testing the Detection

### Step 1: Start All Services
Make sure all 3 services are running (checking logs):
- Backend: `✅ Server running on port 3000`
- ML Service: `✅ Ready to detect coconut lumber!`
- Frontend: `VITE v... ready in ... ms`

### Step 2: Access Camera Scanner
1. Open http://localhost:5173
2. Login with staff account
3. Go to **📹 Camera Scanner** in sidebar

### Step 3: Test Detection
1. Click **🎥 Start Camera** (allow camera permission)
2. Point at:
   - 📋 **Paper/Object** → Will say "Not detected"
   - 🌳 **Tree/Wood/Plant** → Will detect and measure
   - 🧑 **Person** → Will say "Human detected" (safety)
3. Click **🟢 Start Detection**
4. Click **📸 Capture**
5. Results show instantly!

## 📊 Expected Detection Results

### ✅ If Wood Detected:
```json
{
  "detectedClass": "cocolumber",
  "confidence": 87,
  "height": "9.4 m",
  "diameter": "42 cm",
  "estimatedLumber": "95 board feet",
  "quality": "Grade A"
}
```

### ❌ If Human Detected:
```json
{
  "detectedClass": "human",
  "confidence": 92,
  "error": "Human detected - safety check"
}
```

### ❓ If Nothing Detected:
```json
{
  "detectedClass": "not_cocolumber",
  "confidence": 0,
  "error": "No cocolumber detected"
}
```

## 🛠️ Troubleshooting

### "ML Service Unavailable"
**Problem:** Backend can't connect to ML service
**Solution:**
1. Check Python is installed: `python --version`
2. Install ML dependencies: `cd ml-service && pip install -r requirements.txt`
3. Start ML service: `python app.py`
4. Verify it runs on http://localhost:5000 (check browser)

### "No image to analyze"
**Problem:** Camera capture failed
**Solution:**
1. Check browser console (F12) for errors
2. Ensure browser has camera permission
3. Try "📁 Upload Image" tab instead
4. Try different image file

### "Connection failed"
**Problem:** All services not running
**Solution:**
```bash
# Check what's running on ports:
netstat -ano | findstr :3000  # Backend
netstat -ano | findstr :5000  # ML Service
netstat -ano | findstr :5173  # Frontend

# If ports in use, kill process:
taskkill /PID [PID_NUMBER] /F
```

### "Detection timeout"
**Problem:** ML model takes too long
**Solution:**
1. First detection takes ~5-10s (model loading)
2. Subsequent detections are faster
3. Make sure you have 4GB+ free RAM
4. Check ML service logs for errors

## 🎯 How to Train/Improve Detection

The ML model uses **TensorFlow MobileNetV2** (pre-trained on ImageNet).

To improve accuracy for your specific cocolumber:

### Option 1: Collect Training Data (Best)
```bash
# 1. Take 100+ photos of your cocolumber from different angles
# 2. Save in ml-service/training_data/cocolumber/
# 3. Take 100+ photos of non-cocolumber objects
#4. Save in ml-service/training_data/other_objects/
# 5. Run training script (to be created)
```

### Option 2: Adjust Detection Thresholds
Edit `ml-service/app.py`:
```python
# Line ~180: Increase confidence threshold
if human_detected and max_confidence > 0.5:  # Change 0.3 to 0.5

# Line ~194: Adjust wood detection thresholds
if wood_detected or wood_like:
    confidence = int((max_confidence * 100) if wood_detected else 65)
    # Try different thresholds here
```

## 📱 Mobile Camera Tips
- **Lighting:** Good natural light works best
- **Angle:** Capture full height of cocolumber
- **Distance:** 1-3 meters away for best results
- **Position:** Keep parallel to earth for accurate measurements
- **Focus:** Wait for camera to focus before capture

## 🔐 Security Notes
- All images are processed locally (no cloud upload)
- Detection happens on your hardware
- Images not stored permanently
- Only staff/admin can access scanner

## 📚 ML Model Details

**Model:** TensorFlow MobileNetV2
- **Size:** ~13 MB (lightweight, fast)
- **Classes:** 1000 ImageNet categories
- **Accuracy:** 74% top-1 on ImageNet
- **Speed:** ~100-200ms per image

**Detection Pipeline:**
1. Resize image to 224x224 pixels
2. Normalize pixel values
3. Run through MobileNetV2
4. Get top 10 predictions with confidence scores
5. Map to custom categories (human/wood/other)
6. Estimate measurements using computer vision

**Wood Measurement Estimation:**
- Uses edge detection + contour analysis
- Estimates diameter from contour width
- Estimates height from contour height
- Calculates volume using Smalian's formula
- Returns board feet equivalent

## 🎓 Next Steps

1. ✅ Start all 3 services (Database/Backend/ML)
2. ✅ Test camera with different objects
3. ✅ Verify detection accuracy
4. 🔄 Train custom model with your specific cocolumber (optional)
5. 📊 Export detection results to PDF (future)
6. 🗄️ Store measurements in database (future)

---

**Need Help?** Check:
- ML Service logs: `ml-service/app.py` output
- Backend logs: `backend/server.js` output
- Frontend console: Browser Developer Tools (F12)
- Database: Check `chat_conversations`, `users` tables exist
