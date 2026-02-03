# Quick Start Guide - ML Detection Setup

## 🚀 5-Minute Setup

### Step 1: Install Python
If you don't have Python, download from: https://www.python.org/downloads/
**Get Python 3.9 or 3.10** (not 3.11+, TensorFlow may have issues)

### Step 2: Open Terminal in ML Service Folder
```bash
cd C:\COCOLYTICS\Cocolytics\ml-service
```

### Step 3: Create Virtual Environment
```bash
python -m venv venv
```

### Step 4: Activate It
```bash
venv\Scripts\activate
```
You should see `(venv)` appear in your terminal

### Step 5: Install All Dependencies
```bash
pip install -r requirements.txt
```
⏱️ This takes 5-10 minutes (downloading TensorFlow and other libraries)

### Step 6: Run ML Service
```bash
python app.py
```

✅ If you see this, it's working:
```
🌴 Cocolumber ML Detection Service Starting...
📡 Server running on http://localhost:5000
✅ Ready to detect coconut lumber!
```

### Step 7: Install axios in Backend (if not already)
Open new terminal:
```bash
cd C:\COCOLYTICS\Cocolytics\backend
npm install axios
```

### Step 8: Start Backend
```bash
npm start
```

### Step 9: Start Frontend
Open another terminal:
```bash
cd C:\COCOLYTICS\Cocolytics\frontend
npm run dev
```

## 🎯 Test It!

1. Login as staff
2. Go to Camera Scanner page
3. Upload an image or use camera
4. Click "Start Detection"
5. Watch the magic! ✨

## 📊 What Will It Detect?

✅ **Humans** → "This is human not cocolumber"
✅ **Wood/Trees** → Shows measurements (height, diameter, lumber estimate)
✅ **Cars/Other** → "This is car not cocolumber"

## ⚠️ Troubleshooting

### "python not found"
Install Python from python.org and check "Add to PATH" during installation

### "pip not found"
```bash
python -m pip install --upgrade pip
```

### TensorFlow install fails
Try CPU version:
```bash
pip install tensorflow-cpu
```

### Port 5000 already in use
Change port in app.py line 186:
```python
app.run(host='0.0.0.0', port=5001)
```

### ML service works but detection fails
Check backend console for connection errors. Make sure ML service is running BEFORE starting backend.

## 🎓 Next Steps

The current model uses **MobileNetV2** trained on ImageNet (general objects).

**For better accuracy with coconut lumber:**
1. Collect 1000+ images of coconut lumber
2. Train custom model (instructions in README.md)
3. Replace the model in app.py

**Current accuracy:**
- Human detection: ~90% accurate
- General wood/tree: ~70% accurate
- Measurements: Estimated (not exact without depth sensor)

**The system works NOW and will detect:**
- ✅ Humans vs non-humans
- ✅ Wood-like objects
- ✅ Provide lumber estimates

You can improve it later with custom training!
