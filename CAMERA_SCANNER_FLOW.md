# 🎯 Camera Scanner ML Flow - How It All Works Together

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    🌐 WEB BROWSER (Port 5173)                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │             Vue.js - CameraScanner.vue                     │ │
│  │  ┌─────────────────┐  ┌──────────────────┐               │ │
│  │  │ 📸 Camera Tabs  │  │ 📁 Upload Image  │               │ │
│  │  └─────────────────┘  └──────────────────┘               │ │
│  │           ↓                      ↓                        │ │
│  │   ┌─────────────────────────────────┐                    │ │
│  │   │  Base64 Encode Image Data       │                    │ │
│  │   └──────────────┬──────────────────┘                    │ │
│  └──────────────────┼────────────────────────────────────────┘ │
│                     │ HTTP POST JSON                            │
│                     ▼                                            │
└─────────────────────────────────────────────────────────────────┘
                      │ {"image": "data:image/png;base64,..."}
                      │ Auth: Bearer JWT Token
                      │
┌─────────────────────────────────────────────────────────────────┐
│         📡 BACKEND SERVER (Node.js - Port 3000)                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Route: POST /api/staff/detect-cocolumber                 │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Step 1: Verify JWT Token (authenticateToken)        │ │ │
│  │  │ Step 2: Check Role is staff/admin (authorizeRoles)  │ │ │
│  │  │ Step 3: Receive Base64 image                        │ │ │
│  │  │ Step 4: Forward to Python ML Service               │ │ │
│  │  └────────────────────┬─────────────────────────────────┘ │ │
│  └──────────────────────┼────────────────────────────────────┘ │
│                         │ axios.post('http://localhost:5000/predict')
└─────────────────────────┼────────────────────────────────────────┘
                          │ {"image": "data:image/png;base64,..."}
                          │ Timeout: 30 seconds
                          │
┌─────────────────────────────────────────────────────────────────┐
│         🔍 ML SERVICE (Python Flask - Port 5000)                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Route: POST /predict                                      │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Step 1: Decode Base64 → PIL Image                  │ │ │
│  │  │ Step 2: Resize to 224x224 pixels                   │ │ │
│  │  │ Step 3: Preprocess pixel values (normalize)        │ │ │
│  │  │ Step 4: Load TensorFlow MobileNetV2 Model          │ │ │
│  │  │ Step 5: Run inference → Get top 10 predictions    │ │ │
│  │  │         Example: [                                 │ │ │
│  │  │           (0.65, 'tree'),                          │ │ │
│  │  │           (0.12, 'plant'),                         │ │ │
│  │  │           (0.08, 'wood'),                          │ │ │
│  │  │           ...                                      │ │ │
│  │  │         ]                                          │ │ │
│  │  │ Step 6: Map classes to categories:                │ │ │
│  │  │         - HUMAN_CLASSES: person, face, suit...   │ │ │
│  │  │         - WOOD_CLASSES: tree, wood, timber...    │ │ │
│  │  │ Step 7: If wood detected →                        │ │ │
│  │  │         - Run edge detection (Canny)             │ │ │
│  │  │         - Find contours (tree trunk)             │ │ │
│  │  │         - Estimate height, diameter              │ │ │
│  │  │         - Calculate volume (Smalian's formula)    │ │ │
│  │  │         - Assess quality (uniformity score)       │ │ │
│  │  │ Step 8: Return JSON response                      │ │ │
│  │  └────────────────┬─────────────────────────────────┘ │ │
│  └───────────────────┼─────────────────────────────────────┘ │
│                      │                                        │
└──────────────────────┼────────────────────────────────────────┘
                       │ JSON Response with results
                       │
    ┌──────────────────────────────────────────┐
    │ 3 Possible Response Types:               │
    ├──────────────────────────────────────────┤
    │ 1. 🌳 WOOD DETECTED:                     │
    │    {                                     │
    │      "detectedClass": "cocolumber",      │
    │      "confidence": 87,                   │
    │      "height": "9.4",                    │
    │      "diameter": "42",                   │
    │      "estimatedLumber": "95",            │
    │      "quality": "Grade A"                │
    │    }                                     │
    ├──────────────────────────────────────────┤
    │ 2. 🧑 HUMAN DETECTED:                    │
    │    {                                     │
    │      "detectedClass": "human",           │
    │      "confidence": 92                    │
    │    }                                     │
    ├──────────────────────────────────────────┤
    │ 3. ❌ NOTHING DETECTED:                  │
    │    {                                     │
    │      "detectedClass": "not_cocolumber",  │
    │      "confidence": 0,                    │
    │      "error": "No cocolumber detected"   │
    │    }                                     │
    └──────────────────────────────────────────┘
                       │
                       │ axios returns response
                       │
┌─────────────────────────────────────────────────────────────────┐
│         📡 BACKEND (received from ML service)                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Step 9: Validate response                              │ │
│  │  Step 10: Log detection results                         │ │
│  │  Step 11: Send response back to frontend (with CORS)   │ │
│  └────────────────┬─────────────────────────────────────────┘ │
└───────────────────┼────────────────────────────────────────────┘
                    │ HTTP 200 + JSON response
                    │
┌───────────────────────────────────────────────────────────────┐
│    🌐 FRONTEND - Display Results                              │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Step 12: Parse JSON response                          │ │
│  │  Step 13: Check detectedClass:                         │ │
│  │           ✓ cocolumber → Show measurements            │ │
│  │           ✓ human → Show "Human detected" warning    │ │
│  │           ✓ not_cocolumber → Show error message      │ │
│  │  Step 14: Display in scanner results card             │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │ 🔍 Detection Results                          │  │ │
│  │  ├────────────────────────────────────────────────┤  │ │
│  │  │ Tree Detected:      Yes ✓                     │  │ │
│  │  │ Confidence:         87%                       │  │ │
│  │  │ Height:             9.4 m                     │  │ │
│  │  │ Diameter:           42 cm                     │  │ │
│  │  │ Est. Lumber:        95 board feet             │  │ │
│  │  │ Quality:            Grade A                   │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

## 🔄 Complete Request-Response Flow

### Request Flow (Client → Server → ML)
```
1. User Action: Click 📸 Capture or 🟢 Start Detection
   └─> Screenshot from video or image from upload

2. Frontend (Vue.js)
   └─> Convert image to Base64
   └─> Send POST to /api/staff/detect-cocolumber
   └─> Include JWT Token in Authorization header
   └─> Send JSON: { image: "data:image/png;base64,..." }

3. Backend (Node.js)
   └─> Verify JWT token (is user logged in?)
   └─> Check user role (is staff or admin?)
   └─> Receive Base64 image
   └─> Forward to ML service: POST http://localhost:5000/predict
   └─> Wait for response (max 30 seconds)

4. ML Service (Python TensorFlow)
   └─> Decode Base64 image
   └─> Load TensorFlow MobileNetV2 model (first time: ~3-5 sec)
   └─> Preprocess image (224x224, normalize)
   └─> Run inference (top 10 predictions)
   └─> Classify: Is it human? wood? other?
   └─> If wood: estimate measurements
   └─> Return JSON result

5. Backend (receives ML response)
   └─> Validate response
   └─> Log results to console
   └─> Send response back to frontend

6. Frontend (receives results)
   └─> Update scanResults data
   └─> Re-render Vue component
   └─> Display results to user
```

### Response Format by Detection Type

**Type 1: Cocolumber Detected** ✅
```json
{
  "detectedClass": "cocolumber",
  "confidence": 87,
  "height": "9.4",
  "diameter": "42",
  "estimatedLumber": "95",
  "quality": "Grade A",
  "rawPredictions": [
    {"class": "tree", "confidence": 0.65},
    {"class": "plant", "confidence": 0.12},
    {"class": "wood", "confidence": 0.08}
  ]
}
```

**Type 2: Human Detected** ⚠️
```json
{
  "detectedClass": "human",
  "confidence": 92,
  "rawPredictions": [
    {"class": "person", "confidence": 0.92},
    {"class": "face", "confidence": 0.05}
  ]
}
```

**Type 3: Nothing Detected** ❌
```json
{
  "detectedClass": "not_cocolumber",
  "confidence": 0,
  "error": "No cocolumber detected. Only cocolumber/wood/logs/trees can be scanned.",
  "rawPredictions": [
    {"class": "car", "confidence": 0.45},
    {"class": "bicycle", "confidence": 0.32}
  ]
}
```

## 🚀 Quick Start

### 1. First Time: Install everything
```bash
cd C:\COCOLYTICS\Cocolytics

# Install backend dependencies
cd backend
npm install

# Install ML service dependencies
cd ../ml-service
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Every Time: Start all services
**Option A - Batch file (easiest)**
```bash
# Double-click START_ALL.bat
# Or run in terminal:
START_ALL.bat
```

**Option B - PowerShell**
```powershell
# Run as administrator:
powershell -ExecutionPolicy Bypass -File "START_ALL.ps1"
```

**Option C - Manual (3 terminals)**
```bash
# Terminal 1
cd backend && node server.js

# Terminal 2  
cd ml-service && python app.py

# Terminal 3
cd frontend && npm run dev
```

### 3. Open and use
```
http://localhost:5173 
→ Login → Camera Scanner → Start Camera → Capture → Detect!
```

## 📊 Expected Performance

| Operation | Time | Note |
|-----------|------|------|
| Model Load (first time) | 5-10s | TensorFlow initializing |
| Model Load (cached) | <1s | Subsequent requests |
| Image Processing | 100-200ms | Resize, normalize |
| Inference | 50-100ms | MobileNetV2 prediction |
| Edge Detection | 100-200ms | Contour analysis |
| **Total First Detection** | 6-12s | One time per session |
| **Total Subsequent** | 300-400ms | After model loaded |

## 🛠️ Debugging Tips

### Check if ML Service is running
```bash
curl http://localhost:5000/health
# Expected: {"status": "healthy", "service": "ML Detection Service"}
```

### Check if Backend is running
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000
```

### View Backend Console Logs
```
🔍 Top predictions: ['tree', 'plant', 'forest']
📊 Confidence scores: [0.65, 0.12, 0.08]
👤 Human detected: false
🌳 Wood detected: true
🪵 Wood-like heuristic: true
```

### View ML Service Console Logs
```
[15:30:45] POST /predict
[15:30:49] ✅ ML Service response: {"detectedClass": "cocolumber", ...}
```

### Browser Console Logs (F12)
```
Starting detection...
Captured Image: Available (245432 chars)
Using image data: Yes (245432 chars)
Sending to API: http://localhost:3000/api/staff/detect-cocolumber
Image size: 245432 bytes
Response status: 200
Detection result: {detectedClass: "cocolumber", confidence: 87, ...}
```

## 🎓 Key Features

✅ **Real-time Detection** - Get results in <1 second (after first load)  
✅ **Measurements** - Automatic height, diameter, volume estimation  
✅ **Quality Assessment** - Automatic Grade A/B/Premium classification  
✅ **Safety Check** - Won't scan if person detected  
✅ **Fallback Mode** - Works with simulation if ML service unavailable  
✅ **Mobile Ready** - Works on any camera-enabled device  
✅ **Local Processing** - No cloud uploads, all processing local  

## 🔐 Security

- ✅ JWT authentication required
- ✅ Role-based access (staff/admin only)
- ✅ 30-second timeout to prevent hanging requests
- ✅ CORS enabled for trusted origins
- ✅ No image storage (processed in memory)

---

Your camera is now ready to detect and measure coconut lumber! 🌴🎥
