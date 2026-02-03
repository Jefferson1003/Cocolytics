# ML Model Integration Guide for Cocolumber Detection

## Overview
This guide explains how to integrate a real machine learning model for detecting coconut lumber vs other objects.

## Approach 1: TensorFlow.js (Node.js Backend)

### Installation
```bash
npm install @tensorflow/tfjs-node
```

### Implementation
```javascript
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

// Load your trained model
let model;
async function loadModel() {
  model = await tf.loadLayersModel('file://./models/cocolumber-model/model.json');
}

// Prediction function
async function detectCocolumber(imageBase64) {
  // Convert base64 to tensor
  const imageBuffer = Buffer.from(imageBase64.split(',')[1], 'base64');
  const tfimage = tf.node.decodeImage(imageBuffer);
  
  // Resize to model input size (e.g., 224x224)
  const resized = tf.image.resizeBilinear(tfimage, [224, 224]);
  const normalized = resized.div(255.0);
  const batched = normalized.expandDims(0);
  
  // Predict
  const predictions = await model.predict(batched).data();
  
  // Process predictions
  const classes = ['cocolumber', 'human', 'car', 'other'];
  const maxIndex = predictions.indexOf(Math.max(...predictions));
  
  return {
    detectedClass: classes[maxIndex],
    confidence: Math.round(predictions[maxIndex] * 100),
    // Add estimation logic for lumber dimensions
    height: calculateHeight(predictions),
    diameter: calculateDiameter(predictions),
    estimatedLumber: calculateLumber(predictions),
    quality: assessQuality(predictions)
  };
}
```

## Approach 2: Python ML Service (Recommended for Complex Models)

### Python Service (Flask/FastAPI)
```python
# ml_service.py
from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import base64
import io

app = Flask(__name__)

# Load your trained model
model = tf.keras.models.load_model('./models/cocolumber_detector.h5')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    image_data = data['image'].split(',')[1]
    
    # Decode base64 image
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes))
    
    # Preprocess
    image = image.resize((224, 224))
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    
    # Predict
    predictions = model.predict(image_array)
    
    # Classes: ['cocolumber', 'human', 'car', 'other']
    class_idx = np.argmax(predictions[0])
    confidence = float(predictions[0][class_idx] * 100)
    
    classes = ['cocolumber', 'human', 'car', 'other']
    detected_class = classes[class_idx]
    
    if detected_class == 'cocolumber':
        # Use additional models or calculations for measurements
        return jsonify({
            'detectedClass': detected_class,
            'confidence': confidence,
            'height': estimate_height(image_array),
            'diameter': estimate_diameter(image_array),
            'estimatedLumber': calculate_lumber_volume(image_array),
            'quality': assess_quality(image_array)
        })
    else:
        return jsonify({
            'detectedClass': detected_class,
            'confidence': confidence
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### Node.js Backend Integration
```javascript
const axios = require('axios');

router.post('/detect-cocolumber', async (req, res) => {
  try {
    const { image } = req.body;
    
    // Call Python ML service
    const response = await axios.post('http://localhost:5000/predict', {
      image: image
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Detection error:', error);
    res.status(500).json({ message: 'Detection failed' });
  }
});
```

## Approach 3: Cloud Services (Easiest, No Training Required)

### Google Cloud Vision API
```javascript
const vision = require('@google-cloud/vision');

async function detectObjects(imageBase64) {
  const client = new vision.ImageAnnotatorClient({
    keyFilename: './google-cloud-key.json'
  });
  
  const [result] = await client.labelDetection(imageBase64);
  const labels = result.labelAnnotations;
  
  // Check for specific labels
  const isHuman = labels.some(l => 
    ['person', 'human', 'people'].includes(l.description.toLowerCase())
  );
  
  const isWood = labels.some(l => 
    ['wood', 'tree', 'lumber', 'timber'].includes(l.description.toLowerCase())
  );
  
  if (isHuman) {
    return { detectedClass: 'human', confidence: 95 };
  } else if (isWood) {
    return { 
      detectedClass: 'cocolumber',
      confidence: 88,
      // You'd need additional logic for measurements
    };
  } else {
    return { detectedClass: 'other', confidence: 75 };
  }
}
```

## Training Your Own Model

### Dataset Requirements
1. Collect images:
   - 1000+ images of coconut lumber
   - 500+ images of humans
   - 500+ images of other objects (cars, buildings, etc.)

2. Label your data using tools like:
   - Roboflow
   - LabelImg
   - CVAT

### Training with TensorFlow/Keras
```python
import tensorflow as tf
from tensorflow.keras import layers, models

# Build model
model = models.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(4, activation='softmax')  # 4 classes
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Train
model.fit(train_dataset, epochs=50, validation_data=val_dataset)

# Save
model.save('cocolumber_detector.h5')
```

## Recommended Quick Start

1. **For immediate deployment**: Use Google Cloud Vision API or AWS Rekognition
2. **For custom solution**: Train a model using transfer learning (MobileNet/ResNet)
3. **For best accuracy**: Collect dataset → Train custom CNN → Deploy with Python Flask

## Next Steps

1. Choose your approach based on:
   - Budget (cloud vs self-hosted)
   - Accuracy needs
   - Development time
   - Maintenance capability

2. Implement the chosen solution
3. Test with real images
4. Fine-tune detection thresholds
5. Add dimension estimation logic
