# Cocolumber ML Detection Service

## Setup Instructions

### 1. Install Python (if not already installed)
Download Python 3.9 or 3.10 from https://www.python.org/downloads/

### 2. Create Virtual Environment
```bash
cd C:\COCOLYTICS\Cocolytics\ml-service
python -m venv venv
```

### 3. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

This will install:
- Flask (web server)
- TensorFlow (ML framework)
- OpenCV (image processing)
- Pillow (image handling)
- NumPy (numerical computing)

### 5. Run the ML Service
```bash
python app.py
```

You should see:
```
🌴 Cocolumber ML Detection Service Starting...
📡 Server running on http://localhost:5000
✅ Ready to detect coconut lumber!
```

### 6. Update Backend to Use ML Service

The backend is already configured to call the ML service at `http://localhost:5000/predict`

### 7. Test the Detection

1. Start the ML service: `python app.py`
2. Start the backend: `cd ../backend && npm start`
3. Start the frontend: `cd ../frontend && npm run dev`
4. Navigate to Camera Scanner page
5. Upload an image or use camera
6. Click "Start Detection"

## How It Works

### Detection Logic:

1. **Human Detection**: 
   - Uses MobileNetV2 pre-trained on ImageNet
   - Detects person, human, man, woman, child, face, etc.
   - Returns error: "This is human not cocolumber"

2. **Cocolumber Detection**:
   - Detects wood, tree, timber, log, bark, trunk
   - Estimates dimensions using computer vision
   - Calculates lumber volume using Smalian's formula

3. **Other Objects**:
   - Detects car, building, animal, etc.
   - Returns error with detected object name

### Measurements:

- **Height**: Estimated from image vertical dimensions
- **Diameter**: Calculated from trunk width in image
- **Lumber Volume**: Uses forestry formula (board feet)
- **Quality Grade**: Based on trunk uniformity
  - Premium: >70% uniformity
  - Grade A: 50-70% uniformity
  - Grade B: <50% uniformity

## Improving Accuracy

### For Better Detection:

1. **Collect Your Own Dataset**:
   - 1000+ images of coconut lumber
   - 500+ images of humans
   - 500+ images of other objects
   - Label them properly

2. **Train Custom Model**:
   ```python
   # Use transfer learning
   base_model = tf.keras.applications.MobileNetV2(weights='imagenet', include_top=False)
   model = tf.keras.Sequential([
       base_model,
       tf.keras.layers.GlobalAveragePooling2D(),
       tf.keras.layers.Dense(128, activation='relu'),
       tf.keras.layers.Dropout(0.5),
       tf.keras.layers.Dense(3, activation='softmax')  # 3 classes: cocolumber, human, other
   ])
   ```

3. **Replace Model**:
   - Save trained model: `model.save('cocolumber_model.h5')`
   - Load in app.py: `model = tf.keras.models.load_model('cocolumber_model.h5')`

## Troubleshooting

### TensorFlow Installation Issues:
```bash
pip install tensorflow-cpu  # If GPU not needed
```

### Port Already in Use:
Change port in app.py:
```python
app.run(host='0.0.0.0', port=5001)  # Use different port
```

Update backend to match:
```javascript
const response = await axios.post('http://localhost:5001/predict', { image });
```

### CORS Errors:
Already handled with flask-cors

## Production Deployment

For production, use:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

Or deploy to:
- Heroku
- AWS EC2
- Google Cloud Run
- Azure App Service

## API Documentation

### Endpoint: POST /predict

**Request:**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

**Response (Cocolumber):**
```json
{
  "detectedClass": "cocolumber",
  "confidence": 88,
  "height": "12.3",
  "diameter": "45",
  "estimatedLumber": "125",
  "quality": "Grade A"
}
```

**Response (Human):**
```json
{
  "detectedClass": "human",
  "confidence": 92
}
```

**Response (Other):**
```json
{
  "detectedClass": "car",
  "confidence": 85
}
```
