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

# Try to load custom trained brown detector model
custom_brown_detector = None
try:
    import os
    if os.path.exists('brown_detector_model.h5'):
        print("📦 Loading custom brown detector model...")
        custom_brown_detector = tf.keras.models.load_model('brown_detector_model.h5')
        print("✅ Custom brown detector loaded!")
    else:
        print("ℹ️  Custom brown detector not found (brown_detector_model.h5)")
        print("   💡 Run: python train_brown_detector.py --train")
except Exception as e:
    print(f"⚠️  Could not load custom brown detector: {e}")
    print("   Using HSV-based brown detection instead...")

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
    Estimate tree dimensions using brown color detection and computer vision
    Returns: height (m), width (cm), volume (board feet), and quality assessment
    """
    # Convert PIL to OpenCV
    img_cv = cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)
    height_px, width_px = img_cv.shape[:2]
    
    print(f"📐 Image dimensions: {width_px}x{height_px} pixels")
    
    # Convert to HSV for better brown color detection
    hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
    
    # Define comprehensive brown color ranges to detect ALL brown variations
    # Brown exists primarily in H=0-40 range (includes reds, oranges, yellows, browns)
    
    # Range 1: Reddish-brown (red spectrum: H=0-10)
    lower_brown1 = np.array([0, 20, 20])
    upper_brown1 = np.array([10, 255, 255])
    
    # Range 2: Orange-brown (H=10-25)
    lower_brown2 = np.array([10, 20, 20])
    upper_brown2 = np.array([25, 255, 255])
    
    # Range 3: Yellow-brown (H=25-40, the brown/tan range)
    lower_brown3 = np.array([25, 15, 15])
    upper_brown3 = np.array([40, 255, 255])
    
    # Range 4: Dark browns with LOW saturation (grayish/muted browns)
    lower_brown4 = np.array([0, 5, 10])
    upper_brown4 = np.array([40, 80, 255])
    
    # Range 5: Very light/pale browns (high V, low-mid S)
    lower_brown5 = np.array([15, 10, 100])
    upper_brown5 = np.array([35, 100, 255])
    
    # Create masks for ALL brown color variations
    mask1 = cv2.inRange(hsv, lower_brown1, upper_brown1)
    mask2 = cv2.inRange(hsv, lower_brown2, upper_brown2)
    mask3 = cv2.inRange(hsv, lower_brown3, upper_brown3)
    mask4 = cv2.inRange(hsv, lower_brown4, upper_brown4)
    mask5 = cv2.inRange(hsv, lower_brown5, upper_brown5)
    
    # Combine all brown masks
    brown_mask = cv2.bitwise_or(mask1, mask2)
    brown_mask = cv2.bitwise_or(brown_mask, mask3)
    brown_mask = cv2.bitwise_or(brown_mask, mask4)
    brown_mask = cv2.bitwise_or(brown_mask, mask5)
    
    # Apply morphological operations to clean the mask
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    brown_mask = cv2.morphologyEx(brown_mask, cv2.MORPH_CLOSE, kernel)
    brown_mask = cv2.morphologyEx(brown_mask, cv2.MORPH_OPEN, kernel)
    
    print(f"🟤 Brown pixels detected: {np.count_nonzero(brown_mask)} / {brown_mask.size}")
    
    # Find contours on the brown mask
    contours, _ = cv2.findContours(brown_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        # Find largest contour (the tree trunk)
        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        print(f"📍 Object location: x={x}, y={y}")
        print(f"📏 Object size in pixels: width={w}, height={h}")
        
        # Calculate contour area and fill ratio for quality
        contour_area = cv2.contourArea(largest_contour)
        bbox_area = w * h
        fill_ratio = contour_area / bbox_area if bbox_area > 0 else 0
        
        print(f"🎯 Fill ratio: {fill_ratio:.2%}")
        
        # ========== MEASUREMENT CALIBRATION ==========
        # Assumed camera field of view and typical measurement scenarios
        # These factors map pixel dimensions to real-world measurements
        
        # For a typical camera at 1-3 meters distance:
        # - 1 pixel ≈ 0.5-1 cm (depth dependent)
        # - Use conservative scaling factors
        
        # Height calculation (vertical extent in image)
        # Typical tree height 8-15m, image height ~480px
        # So: 1 pixel ≈ 0.02m for height
        pixel_to_meter_height = 0.02  # 1 pixel = 2 cm
        estimated_height_m = max(3, min(20, (h * pixel_to_meter_height)))  # Clamp between 3-20m
        
        # Width calculation (horizontal extent - trunk diameter or log width)
        # Typical trunk width 20-80cm, image width varies
        # So: 1 pixel ≈ 1-2 cm for width/diameter
        pixel_to_cm_width = 2  # 1 pixel = 2 cm
        estimated_width_cm = max(15, min(100, (w * pixel_to_cm_width)))  # Clamp between 15-100cm
        
        print(f"📐 Calculated measurements:")
        print(f"   Height: {estimated_height_m:.1f} m ({h} px × {pixel_to_meter_height})")
        print(f"   Width:  {estimated_width_cm:.0f} cm ({w} px × {pixel_to_cm_width})")
        
        # ========== VOLUME ESTIMATION ==========
        # Using Smalian's formula: V = (D²/4) × π × L
        # Where D = diameter in meters, L = length in meters
        
        diameter_m = estimated_width_cm / 100  # Convert cm to m
        length_m = estimated_height_m
        
        # Volume in cubic meters
        volume_cubic_m = ((diameter_m ** 2) / 4) * 3.14159 * length_m
        
        # Convert to board feet (1 cubic meter ≈ 424 board feet)
        board_feet = max(40, int(volume_cubic_m * 424))
        
        print(f"📦 Volume calculation:")
        print(f"   Diameter: {diameter_m:.3f} m")
        print(f"   Length:   {length_m:.2f} m")
        print(f"   Volume:   {volume_cubic_m:.4f} m³")
        print(f"   Board feet: {board_feet}")
        
        # ========== QUALITY ASSESSMENT ==========
        # Based on contour uniformity and fill ratio
        if fill_ratio > 0.75:
            quality = "Premium"
            quality_score = 90
        elif fill_ratio > 0.60:
            quality = "Grade A"
            quality_score = 80
        elif fill_ratio > 0.45:
            quality = "Grade B"
            quality_score = 70
        else:
            quality = "Grade C"
            quality_score = 60
        
        print(f"🏆 Quality: {quality} ({quality_score}/100)")
        
        return {
            'height': str(round(estimated_height_m, 1)),
            'width': str(int(estimated_width_cm)),
            'diameter': str(int(estimated_width_cm)),  # Same as width for display
            'estimatedLumber': str(board_feet),
            'quality': quality,
            'quality_score': quality_score,
            'measurements': {
                'height_m': round(estimated_height_m, 2),
                'width_cm': int(estimated_width_cm),
                'volume_cubic_m': round(volume_cubic_m, 4),
                'board_feet': board_feet,
                'fill_ratio': round(fill_ratio, 2),
                'pixels_detected': np.count_nonzero(brown_mask)
            }
        }
    
    else:
        print("⚠️  No contours found in brown mask")
    
    # Default values if detection fails
    return {
        'height': '10.5',
        'width': '42',
        'diameter': '42',
        'estimatedLumber': '95',
        'quality': 'Grade A',
        'quality_score': 80,
        'measurements': {
            'height_m': 10.5,
            'width_cm': 42,
            'volume_cubic_m': 0.0,
            'board_feet': 95,
            'fill_ratio': 0,
            'pixels_detected': 0
        }
    }
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
    - Detects ALL brown color variations (light, dark, medium, reddish, yellowish, orange, etc.)
    - Strong straight-edge density
    """
    img_cv = cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)

    # Comprehensive brown color masks covering ALL brown variations
    # Range 1: Reddish-brown (H=0-10)
    lower_brown1 = np.array([0, 20, 20])
    upper_brown1 = np.array([10, 255, 255])
    
    # Range 2: Orange-brown (H=10-25)
    lower_brown2 = np.array([10, 20, 20])
    upper_brown2 = np.array([25, 255, 255])
    
    # Range 3: Yellow-brown (H=25-40)
    lower_brown3 = np.array([25, 15, 15])
    upper_brown3 = np.array([40, 255, 255])
    
    # Range 4: Dark/muted browns (low saturation)
    lower_brown4 = np.array([0, 5, 10])
    upper_brown4 = np.array([40, 80, 255])
    
    # Range 5: Light/pale browns (high value, low-mid saturation)
    lower_brown5 = np.array([15, 10, 100])
    upper_brown5 = np.array([35, 100, 255])

    # Combine all brown detection masks
    mask1 = cv2.inRange(hsv, lower_brown1, upper_brown1)
    mask2 = cv2.inRange(hsv, lower_brown2, upper_brown2)
    mask3 = cv2.inRange(hsv, lower_brown3, upper_brown3)
    mask4 = cv2.inRange(hsv, lower_brown4, upper_brown4)
    mask5 = cv2.inRange(hsv, lower_brown5, upper_brown5)
    
    mask = cv2.bitwise_or(mask1, mask2)
    mask = cv2.bitwise_or(mask, mask3)
    mask = cv2.bitwise_or(mask, mask4)
    mask = cv2.bitwise_or(mask, mask5)

    brown_ratio = float(np.count_nonzero(mask)) / float(mask.size)

    # Edge density for plank-like structure
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    edge_ratio = float(np.count_nonzero(edges)) / float(edges.size)

    return brown_ratio > 0.15 and edge_ratio > 0.05

def detect_brown_with_custom_model(image_pil):
    """
    Use trained custom brown detector model if available
    Returns: is_brown (bool), confidence (float 0-1)
    """
    if custom_brown_detector is None:
        return None, None
    
    try:
        # Preprocess image for model
        img_array = np.array(image_pil.resize((224, 224))) / 255.0
        img_batch = np.expand_dims(img_array, axis=0)
        
        # Predict
        prediction = custom_brown_detector.predict(img_batch, verbose=0)[0][0]
        
        # Brown if prediction > 0.5
        is_brown = prediction > 0.5
        confidence = prediction if is_brown else (1 - prediction)
        
        print(f"🤖 Custom model: Brown detected={is_brown}, Confidence={confidence:.2%}")
        
        return is_brown, float(confidence)
    except Exception as e:
        print(f"⚠️  Custom model error: {e}")
        return None, None

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
        
        # Try custom brown detector model FIRST if available
        custom_brown_detected = None
        custom_brown_confidence = 0
        if custom_brown_detector is not None:
            custom_brown_detected, custom_brown_confidence = detect_brown_with_custom_model(image_pil)
            print(f"🤖 Custom brown detector: {custom_brown_detected} (confidence: {custom_brown_confidence:.2%})")
        
        # Heuristic for stacked lumber/planks (fallback)
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
        
        # Check custom model FIRST, then fallback to other detection methods
        elif custom_brown_detected is True and custom_brown_confidence > 0.6:
            # Custom trained model detected brown with high confidence
            measurements = estimate_tree_measurements(image_pil)
            print(f"✅ Using custom brown detector results")
            
            return jsonify({
                'detectedClass': 'cocolumber',
                'confidence': int(custom_brown_confidence * 100),
                'height': measurements['height'],
                'width': measurements['width'],
                'diameter': measurements['diameter'],
                'estimatedLumber': measurements['estimatedLumber'],
                'quality': measurements['quality'],
                'detectionMethod': 'custom_model',
                'rawPredictions': [
                    {'class': pred[1], 'confidence': float(pred[2])}
                    for pred in decoded_predictions[:3]
                ]
            })
        
        elif wood_detected or wood_like:
            # If wood detected by MobileNetV2 or heuristic, treat as cocolumber and provide measurements
            measurements = estimate_tree_measurements(image_pil)
            detection_method = 'mobilenet' if wood_detected else 'hsv_heuristic'
            print(f"✅ Using {detection_method} detection results")
            
            return jsonify({
                'detectedClass': 'cocolumber',
                'confidence': int((max_confidence * 100) if wood_detected else 65),
                'height': measurements['height'],
                'width': measurements['width'],
                'diameter': measurements['diameter'],
                'estimatedLumber': measurements['estimatedLumber'],
                'quality': measurements['quality'],
                'detectionMethod': detection_method,
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
