"""
Cocolumber Detection ML Service
Flask API for detecting coconut lumber vs humans and other objects
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import base64
import io
import cv2

app = Flask(__name__)
CORS(app)

# Load pre-trained MobileNetV2 for general object detection
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=True,
    weights='imagenet'
)

# ImageNet class indices for common objects
HUMAN_CLASSES = [
    'person', 'human', 'man', 'woman', 'child', 'people',
    'suit', 'jersey', 'sweatshirt', 'face'
]

WOOD_CLASSES = [
    'tree', 'wood', 'timber', 'log', 'bark', 'trunk',
    'wooden', 'lumber', 'palm', 'coconut', 'plant',
    'outdoor', 'forest', 'plant stem', 'stick', 'branch',
    'potted plant', 'flowerpot'
]

def decode_predictions_imagenet(preds, top=5):
    """Decode ImageNet predictions to class names"""
    decode = tf.keras.applications.mobilenet_v2.decode_predictions(preds, top=top)
    return decode[0]

def preprocess_image(image_data):
    """Convert base64 image to preprocessed tensor"""
    # Remove data URL prefix if present
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    
    # Decode base64
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize to model input size
    image = image.resize((224, 224))
    
    # Convert to array and preprocess
    image_array = np.array(image)
    image_array = tf.keras.applications.mobilenet_v2.preprocess_input(image_array)
    image_array = np.expand_dims(image_array, axis=0)
    
    return image_array, image

def estimate_tree_measurements(image_pil):
    """
    Estimate tree dimensions using computer vision
    This is a simplified estimation - real implementation would use depth sensing
    """
    # Convert PIL to OpenCV
    img_cv = cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    
    # Simple edge detection for trunk diameter estimation
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        # Find largest contour (assumed to be the tree trunk)
        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Estimate dimensions (these are rough estimates)
        # In real implementation, you'd use camera calibration and reference objects
        estimated_height = round(h / 20 + 8, 1)  # Map pixel height to meters
        estimated_diameter = max(20, min(80, w // 3))  # Map width to cm
        
        # Calculate lumber volume using Smalian's formula approximation
        # V = (D²/4) × π × L where D is diameter in meters, L is length
        diameter_m = estimated_diameter / 100
        height_m = estimated_height
        volume_cubic_m = (diameter_m ** 2 / 4) * 3.14159 * height_m
        # Convert to board feet (1 cubic meter ≈ 424 board feet)
        board_feet = int(volume_cubic_m * 424)
        
        # Quality assessment based on trunk uniformity
        contour_area = cv2.contourArea(largest_contour)
        bbox_area = w * h
        uniformity = contour_area / bbox_area if bbox_area > 0 else 0
        
        if uniformity > 0.7:
            quality = "Premium"
        elif uniformity > 0.5:
            quality = "Grade A"
        else:
            quality = "Grade B"
        
        return {
            'height': str(estimated_height),
            'diameter': str(estimated_diameter),
            'estimatedLumber': str(board_feet),
            'quality': quality
        }
    
    # Default values if detection fails
    return {
        'height': '10.5',
        'diameter': '42',
        'estimatedLumber': '95',
        'quality': 'Grade A'
    }

def is_wood_like(image_pil):
    """
    Heuristic for stacked lumber/planks:
    - Dominant brown/orange tones
    - Strong straight-edge density
    """
    img_cv = cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)

    # Brown/orange color mask (two ranges to cover light/dark wood)
    lower_brown1 = np.array([5, 40, 40])
    upper_brown1 = np.array([25, 255, 255])
    lower_brown2 = np.array([0, 20, 20])
    upper_brown2 = np.array([15, 200, 200])

    mask1 = cv2.inRange(hsv, lower_brown1, upper_brown1)
    mask2 = cv2.inRange(hsv, lower_brown2, upper_brown2)
    mask = cv2.bitwise_or(mask1, mask2)

    brown_ratio = float(np.count_nonzero(mask)) / float(mask.size)

    # Edge density for plank-like structure
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    edge_ratio = float(np.count_nonzero(edges)) / float(edges.size)

    return brown_ratio > 0.15 and edge_ratio > 0.05

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'ML Detection Service'})

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        data = request.json
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Preprocess image
        image_array, image_pil = preprocess_image(data['image'])
        
        # Get predictions from MobileNetV2
        predictions = base_model.predict(image_array)
        decoded_predictions = decode_predictions_imagenet(predictions, top=10)
        
        # Analyze predictions
        detected_classes = [pred[1].lower() for pred in decoded_predictions]
        confidences = [float(pred[2]) for pred in decoded_predictions]
        max_confidence = max(confidences)
        
        # Log predictions for debugging
        print(f"🔍 Top predictions: {detected_classes[:3]}")
        print(f"📊 Confidence scores: {confidences[:3]}")
        
        # Check for human detection
        human_detected = any(
            any(human_class in class_name for human_class in HUMAN_CLASSES)
            for class_name in detected_classes
        )
        
        # Check for wood/tree detection
        wood_detected = any(
            any(wood_class in class_name for wood_class in WOOD_CLASSES)
            for class_name in detected_classes
        )
        
        # Heuristic for stacked lumber/planks
        wood_like = is_wood_like(image_pil)
        
        print(f"👤 Human detected: {human_detected}")
        print(f"🌳 Wood detected: {wood_detected}")
        print(f"🪵 Wood-like heuristic: {wood_like}")
        
        # Determine final classification
        if human_detected and max_confidence > 0.3:
            return jsonify({
                'detectedClass': 'human',
                'confidence': int(max_confidence * 100),
                'rawPredictions': [
                    {'class': pred[1], 'confidence': float(pred[2])}
                    for pred in decoded_predictions[:3]
                ]
            })
        
        elif wood_detected or wood_like:
            # If wood detected, treat as cocolumber and provide measurements
            measurements = estimate_tree_measurements(image_pil)
            
            return jsonify({
                'detectedClass': 'cocolumber',
            'confidence': int((max_confidence * 100) if wood_detected else 65),
                'height': measurements['height'],
                'diameter': measurements['diameter'],
                'estimatedLumber': measurements['estimatedLumber'],
                'quality': measurements['quality'],
                'rawPredictions': [
                    {'class': pred[1], 'confidence': float(pred[2])}
                    for pred in decoded_predictions[:3]
                ]
            })
        
        else:
            # No cocolumber/wood detected - reject the image
            return jsonify({
                'detectedClass': 'not_cocolumber',
                'confidence': 0,
                'error': 'No cocolumber detected. Only cocolumber/wood/logs/trees can be scanned.',
                'rawPredictions': [
                    {'class': pred[1], 'confidence': float(pred[2])}
                    for pred in decoded_predictions[:3]
                ]
            })
        
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🌴 Cocolumber ML Detection Service Starting...")
    print("📡 Server running on http://localhost:5000")
    print("✅ Ready to detect coconut lumber!")
    app.run(host='0.0.0.0', port=5000, debug=True)
