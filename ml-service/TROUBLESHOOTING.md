# 🔧 Troubleshooting Detection Issues

## Common Problems & Solutions

### 1. "Detection Failed" Error

**Problem:** Getting error message when clicking "Start Detection"

**Solutions:**

#### Check if ML Service is Running
```bash
# Open terminal in ml-service folder
cd C:\COCOLYTICS\Cocolytics\ml-service

# Activate virtual environment
venv\Scripts\activate

# Run ML service
python app.py
```

You should see:
```
🌴 Cocolumber ML Detection Service Starting...
📡 Server running on http://localhost:5000
✅ Ready to detect coconut lumber!
```

#### Test ML Service Directly
Open browser and go to: http://localhost:5000/health

Should show:
```json
{"service":"ML Detection Service","status":"healthy"}
```

### 2. Connection Errors

**Error:** "Failed to fetch" or "Network error"

**Check:**
- ✅ ML service is running on port 5000
- ✅ Backend is running on port 3000
- ✅ No firewall blocking localhost connections

**Fix:**
```bash
# Terminal 1 - ML Service
cd C:\COCOLYTICS\Cocolytics\ml-service
venv\Scripts\activate
python app.py

# Terminal 2 - Backend
cd C:\COCOLYTICS\Cocolytics\backend
npm start

# Terminal 3 - Frontend
cd C:\COCOLYTICS\Cocolytics\frontend
npm run dev
```

### 3. "This is [object] not cocolumber" Message

**This means detection is WORKING!** The ML model is correctly identifying non-cocolumber objects.

**Test with different images:**
- ✅ Human photo → "This is human not cocolumber"
- ✅ Car photo → "This is car not cocolumber"
- ✅ Wood/tree photo → Shows lumber measurements

### 4. Always Getting Same Result

**Problem:** Detection always shows same measurements

**Cause:** ML service not running, using fallback simulation

**Fix:** Start ML service as shown above

### 5. Python/TensorFlow Installation Issues

**Windows:**
```bash
# Install Python 3.9 or 3.10 (not 3.11+)
# Download from: https://www.python.org/downloads/

# Install TensorFlow CPU version if GPU fails
pip install tensorflow-cpu

# Or specific version
pip install tensorflow-cpu==2.15.0
```

**Error: "No module named 'tensorflow'"**
```bash
# Make sure virtual environment is activated
venv\Scripts\activate

# Reinstall
pip install -r requirements.txt
```

### 6. CORS Errors

Already handled with flask-cors, but if you see CORS errors:

```python
# In ml-service/app.py, verify this line exists:
from flask_cors import CORS
CORS(app)
```

### 7. Port Already in Use

**Error:** "Port 5000 is already in use"

**Solution 1:** Kill process on port 5000
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Solution 2:** Change port
```python
# In ml-service/app.py, line 186:
app.run(host='0.0.0.0', port=5001)  # Changed to 5001
```

Then update backend:
```javascript
// In backend/server.js, line ~335:
const mlResponse = await axios.post('http://localhost:5001/predict', {
```

## Testing Detection

### Test Images to Try:

1. **Human Photo** 
   - Take selfie or photo of person
   - Should show: "⚠️ Human detected! This is not cocolumber."

2. **Wood/Tree Photo**
   - Photo of any wood, tree trunk, or lumber
   - Should show measurements and "✅ Cocolumber detected successfully!"

3. **Other Objects** (car, building, etc.)
   - Should show: "⚠️ [object] detected! This is not cocolumber."

### Check Browser Console

Press F12 in browser, go to Console tab. Look for:

**Success:**
```
Detection result: {detectedClass: "cocolumber", height: "12.3", ...}
```

**Error:**
```
Detection error: Failed to fetch
```

### Check Backend Console

Should see:
```
✅ Connected to MySQL database
Server is running on http://localhost:3000
```

If you see:
```
ML Service error: connect ECONNREFUSED
ML service not available, using simulation...
```
→ ML service is not running!

### Check ML Service Console

Should show Flask logs:
```
127.0.0.1 - - [03/Feb/2026 10:30:15] "POST /predict HTTP/1.1" 200 -
```

## Quick Diagnostic

Run this checklist:

1. ✅ ML Service running? → Check http://localhost:5000/health
2. ✅ Backend running? → Check http://localhost:3000/api/health
3. ✅ Frontend running? → Check http://localhost:5173
4. ✅ Logged in as staff/admin? → Required for detection endpoint
5. ✅ Image uploaded or captured? → Need image to analyze
6. ✅ Browser console shows errors? → Press F12 to check

## Still Not Working?

### Enable Debug Mode

**Frontend - check what's being sent:**
```javascript
// Already added in startDetection():
console.log('Detection result:', result)
```

**Backend - add logging:**
```javascript
// In server.js, line ~335:
console.log('Calling ML service with image size:', image.length);
console.log('ML Response:', mlResponse.data);
```

**ML Service - check Flask logs:**
Flask automatically logs all requests

### Common Success Pattern:

1. Click "Start Detection"
2. Loading state shows "Analyzing..."
3. Alert popup appears:
   - ✅ "Cocolumber detected successfully!" (for wood)
   - ⚠️ "Human detected! This is not cocolumber." (for humans)
   - ⚠️ "[Object] detected! This is not cocolumber." (for others)
4. Results display (if cocolumber) or error message shows

## Need More Help?

Check logs in this order:
1. Browser console (F12) - frontend errors
2. Backend terminal - API errors
3. ML service terminal - model errors

The system will tell you exactly what's wrong!
