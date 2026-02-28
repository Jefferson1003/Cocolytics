# 🎯 QUICK REFERENCE - Brown Detection Scanner

## ✅ SYSTEM IS READY!

All 3 services are running:
- ✅ Backend (Port 3000)
- ✅ Frontend (Port 5173)  
- ✅ ML Service (Port 5000)

---

## 📱 OPEN ON YOUR PHONE

**URL:** `http://192.168.68.101:5173/staff/camera-scanner`

**Login:**
- Username: `staff` (or your staff account)
- Password: (your password)

---

## 🚀 HOW TO USE

### Method 1: Real-Time Camera
```
1. Click "📹 Start Camera"
2. Point at brown cocolumber
3. Click "🟢 Start Detection"
4. See live dimensions!
```

### Method 2: Capture & Analyze
```
1. Click "📹 Start Camera"
2. Position camera on object
3. Click "📸 Capture"
4. Click "🟢 Start Detection"
5. View results
```

### Method 3: Upload Photo
```
1. Click "📁 Upload Image" tab
2. Choose photo from gallery
3. Click "🟢 Start Detection"
4. View results
```

---

## 📊 WHAT YOU GET

When brown is detected, you'll see:

| Measurement | Example |
|-------------|---------|
| **Height** | 12.5 m |
| **Width** | 45 cm |
| **Diameter** | 45 cm |
| **Board Feet** | 128 |
| **Quality** | Grade A |
| **Confidence** | 92% |

---

## 💡 TIPS FOR BEST RESULTS

✅ **DO:**
- Use good lighting (natural or bright)
- Point camera perpendicular to lumber
- Keep 1-3 meters distance
- Use plain background (not brown)
- Focus camera clearly

❌ **DON'T:**
- Scan in dark areas
- Too close (< 50cm)
- Too far (> 5m)
- Brown background
- Blurry images

---

## 🔧 TROUBLESHOOTING

### "ML Service Unavailable"
```bash
cd c:\COCOLYTICS\Cocolytics\ml-service
python app.py
```

### "No brown detected"
- Improve lighting
- Get closer/farther
- Try different angle
- Ensure object is mostly brown

### Camera not working
- Grant camera permission
- Check WiFi connection
- Try Back/Front camera toggle

---

## 🎓 IMPROVE ACCURACY

Want 90%+ accuracy? Train custom model:

```bash
# 1. Create folders
cd ml-service
mkdir training_data/brown
mkdir training_data/not_brown

# 2. Add 50+ images to each folder
# brown/ = your cocolumber photos
# not_brown/ = other objects

# 3. Train
python train_brown_detector.py --train

# 4. Restart ML service
python app.py
```

---

## 📞 NEED HELP?

1. **Check Services Running:**
   - Backend: http://localhost:3000
   - ML Service: http://localhost:5000
   - Frontend: http://localhost:5173

2. **Restart Everything:**
   - Double-click: `START_BROWN_DETECTION.bat`
   
3. **Read Full Guide:**
   - Open: `BROWN_DETECTION_COMPLETE_GUIDE.md`

---

## 🎉 YOU'RE ALL SET!

Point your phone at brown cocolumber and watch the magic happen! 🌴

The system detects ALL brown shades:
- Light brown (tan, beige)
- Medium brown (wood, lumber)  
- Dark brown (walnut, mahogany)
- Reddish-brown
- Yellow-brown
- Gray-brown

**Happy scanning!** 📸
