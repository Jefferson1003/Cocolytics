# 🟤 Train Your Brown Object Detector

## Quick Start (3 Steps)

### Step 1: Collect Training Data
```bash
# Create directory structure
python train_brown_detector.py

# This creates:
# training_data/
# ├── brown/           (add 50+ brown object images here)
# └── not_brown/       (add 50+ non-brown images here)
```

### Step 2: Add Your Images
Place images in the directories:
- **Brown objects**: Wooden logs, coconut lumber, brown cardboard, wood furniture, leather, soil, etc.
- **Non-brown objects**: Green plants, blue objects, red items, yellow things, white/gray items, etc.

**Image Tips:**
- ✅ Format: JPG, PNG, GIF
- ✅ Size: Any size (auto-resized)
- ✅ Minimum: 50 images per category (100+ for better results)
- ✅ Variety: Different angles, lighting, backgrounds

### Step 3: Train the Model
```bash
# Start training
python train_brown_detector.py --train

# Output:
# 🎓 Starting Training...
# Epoch 1/20 ...
# ✅ Validation Accuracy: 95.34%
# ✅ Model saved: brown_detector_model.h5
```

## How to Collect Training Images

### Option 1: From Your Camera
1. Go to Camera Scanner in your app
2. Point at brown objects and capture
3. Save to `training_data/brown/`

### Option 2: Download from Web
- **Google Images**: Search "wooden log", "brown wood", etc. (brown folder)
- **Unsplash/Pexels**: Search brown objects free stock photos
- **Your Own**: Take photos of brown items around you

### Option 3: Use Sample Images
```bash
# If you just want to test the training pipeline
# You can use 10-20 sample images per category
# (accuracy won't be great, but it demonstrates the full workflow)
```

## Command Reference

### Basic Training
```bash
python train_brown_detector.py --train
```
Trains a new model using pre-trained MobileNetV2 weights

### Fine-Tune Existing Model
```bash
python train_brown_detector.py --finetune --train
```
Fine-tunes an already-trained model for even better accuracy

### Test Specific Image
```bash
python train_brown_detector.py --test path/to/image.jpg
```
Output:
```
🟤 Brown detected: Yes
📊 Confidence: 96.45%
```

### Use Custom Data Directory
```bash
python train_brown_detector.py --train --data-dir my_images
```

### Use Custom Model Path
```bash
python train_brown_detector.py --train --model my_model.h5
```

## What Happens During Training

### Phase 1: Transfer Learning (Default)
- ✅ Uses pre-trained MobileNetV2 weights from ImageNet
- ✅ Fine-tunes top layers only
- ✅ Fast training (5-10 minutes)
- ✅ Works well with small datasets (50-200 images)
- ✅ Great accuracy for brown detection

### Phase 2: Fine-Tuning (Optional)
- ✅ Unfreezes more base model layers
- ✅ Trains with lower learning rate
- ✅ Improves accuracy further
- ✅ Takes longer but more robust

## Training Output Example

```
🟤 Brown Object Detection Model Trainer
==================================================
📂 Loading training data...
✅ Training samples: 240
✅ Validation samples: 60
✅ Batch size: 16

🎓 Starting Training...
   📈 Epochs: 20
   🔄 Learning rate: 0.0001
   ⏱️  This may take several minutes...

Epoch 1/20
8/15 [===============>] - 12s 2s/step - loss: 0.5843 - accuracy: 0.7812 - val_loss: 0.4201 - val_accuracy: 0.8333
...
Epoch 15/20
15/15 [=============================>] - 3s 195ms/step - loss: 0.1234 - accuracy: 0.9688 - val_loss: 0.0876 - val_accuracy: 0.9667

📊 Evaluating Model...
✅ Validation Accuracy: 96.67%
✅ Validation Precision: 97.50%
✅ Validation Recall: 95.83%
✅ Validation AUC: 0.9950

💾 Saving model to: brown_detector_model.h5
✅ Model saved successfully!
   📦 Size: 13.45 MB

✅ Training Complete!
```

## Expected Results

| Dataset Size | Accuracy | Training Time |
|--------------|----------|---------------|
| 50 images    | 80-85%   | 5 min         |
| 100 images   | 85-90%   | 8 min         |
| 200 images   | 90-95%   | 12 min        |
| 500+ images  | 95%+     | 20+ min       |

## Troubleshooting

### Error: "Not enough training data"
```
⚠️ Brown images: 5 (need at least 50)
⚠️ Not-brown images: 3 (need at least 50)
```
**Solution:** Add more images to both folders

### Error: "Out of memory"
**Solution:** Either reduce batch size or close other programs
```bash
# Modify in train_brown_detector.py:
BATCH_SIZE = 8  # Reduce from 16
```

### Poor Accuracy (< 80%)
**Causes:**
- Not enough training data
- Images aren't representative
- Too much noise in images

**Solution:**
- Add 50-100 more images
- Ensure images clearly show brown objects
- Use --finetune flag for better results

### Training Too Slow
**Solution:**
- Use GPU: Install TensorFlow with CUDA support
- Reduce image size (modify IMAGE_SIZE)
- Reduce EPOCHS

## Deploying Trained Model

Once you have a trained model, use it in the ML service:

```python
# In app.py, modify load_model() function:
def load_model():
    try:
        # Try to load custom trained model
        from tensorflow import keras
        model = keras.models.load_model('brown_detector_model.h5')
        print("✅ Custom brown detector loaded")
        return model
    except:
        # Fallback to MobileNetV2
        print("ℹ️  Using default MobileNetV2")
        return MobileNetV2(...)
```

## Next Steps

1. ✅ Collect 50+ brown images
2. ✅ Collect 50+ non-brown images
3. ✅ Run `python train_brown_detector.py --train`
4. ✅ Check accuracy (>90% is good!)
5. ✅ Deploy model to ML service
6. ✅ Test with your camera scanner

## Tips for Best Results

- 📷 **Lighting**: Consistent, well-lit images
- 🎨 **Variety**: Different shades of brown (light, dark, medium)
- 🔄 **Angles**: Photos from multiple angles
- 🎯 **Focus**: Make sure brown object is in focus
- 📊 **Balance**: Similar number of brown vs not-brown images
- 🖼️ **Quality**: Clear, non-blurry images

## Model Architecture

The trained model uses:
- **Base**: MobileNetV2 (pre-trained on ImageNet)
- **Top**: Custom classification head
  - Dense(256, relu) + Dropout
  - Dense(128, relu) + Dropout  
  - Dense(64, relu)
  - Dense(1, sigmoid) ← Binary output (Brown=1, Not-Brown=0)

**Why MobileNetV2?**
- ✅ Lightweight (only 13MB)
- ✅ Fast inference (real-time)
- ✅ High accuracy on visual tasks
- ✅ Works on mobile/edge devices

## File Structure After Training

```
ml-service/
├── train_brown_detector.py      # Training script
├── brown_detector_model.h5      # Trained model ✨
├── brown_detector_model_tf/     # TensorFlow format
├── training_data/
│   ├── brown/
│   │   ├── log1.jpg
│   │   ├── lumber2.jpg
│   │   └── ... (50+ images)
│   └── not_brown/
│       ├── green_leaf.jpg
│       ├── blue_pen.jpg
│       └── ... (50+ images)
└── app.py                        # ML service
```

## Questions?

- **How long to train?** 5-20 minutes depending on data size
- **How much data needed?** Minimum 50 per category
- **Can I add more images later?** Yes! Retrain to improve
- **Is GPU required?** No, but faster if available
- **Can I use on mobile?** Yes! TensorFlow Lite conversion available
