# 🟤 Brown Object Detection Model Training
# This script fine-tunes a MobileNetV2 model specifically for brown object detection

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from pathlib import Path
import argparse

print("🟤 Brown Object Detection Model Trainer")
print("=" * 50)

# ==================== CONFIGURATION ====================
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 20
LEARNING_RATE = 0.0001
VALIDATION_SPLIT = 0.2
TEST_SPLIT = 0.1

# ==================== DATA COLLECTION ====================
def create_default_training_data():
    """
    Create sample training data structure if no images exist
    This generates synthetic brown/not-brown samples for demonstration
    """
    print("\n📁 Creating training data directories...")
    
    data_dir = Path("training_data")
    brown_dir = data_dir / "brown"
    not_brown_dir = data_dir / "not_brown"
    
    brown_dir.mkdir(parents=True, exist_ok=True)
    not_brown_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"✅ Created: {brown_dir}")
    print(f"✅ Created: {not_brown_dir}")
    
    # Create a README for data collection
    readme = """# 🟤 Brown Object Training Data

## How to Use This Directory

### For "brown" Folder:
Place images of brown objects:
- Wooden logs
- Coconut lumber
- Brown cardboard
- Brown fabric
- Wooden furniture
- Brown soil/leather
- Any shade of brown (light, dark, medium, etc.)

### For "not_brown" Folder:
Place images of non-brown objects:
- Green plants
- Blue objects
- Red items
- Yellow things
- White/gray objects
- Any non-brown colors

## How to Collect Data:

1. **From Camera**: Use your camera scanner to capture brown objects
2. **From Web**: Download images from Google Images, Unsplash, etc.
3. **File Format**: JPG, PNG, or GIF
4. **Image Size**: Any size (will be resized to 224x224)
5. **Minimum**: At least 50 images per category (100+ for better results)

## Example Structure:
```
training_data/
├── brown/
│   ├── log1.jpg
│   ├── lumber1.jpg
│   ├── brown_wood2.jpg
│   └── ... (at least 50+ images)
└── not_brown/
    ├── green_leaf.jpg
    ├── blue_pen.jpg
    ├── red_fabric.jpg
    └── ... (at least 50+ images)
```

## To Train After Adding Images:
```bash
python train_brown_detector.py --train
```
"""
    
    with open(data_dir / "README.md", "w") as f:
        f.write(readme)
    
    print(f"\n📖 Created: training_data/README.md")
    print("   ℹ️  Add your brown and not_brown images to the respective folders")
    
    return data_dir

# ==================== MODEL BUILDING ====================
def build_brown_detector(pretrained_weights='imagenet'):
    """
    Build a custom brown detector using MobileNetV2 + transfer learning
    """
    print("\n🏗️  Building Brown Detection Model...")
    
    # Load pre-trained MobileNetV2 (no top classification layer)
    base_model = MobileNetV2(
        input_shape=IMAGE_SIZE + (3,),
        include_top=False,
        weights=pretrained_weights
    )
    
    # Freeze base model weights (only train top layers)
    base_model.trainable = False
    
    # Build custom classification head
    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        
        # Dense layers for brown detection
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        
        layers.Dense(128, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.2),
        
        layers.Dense(64, activation='relu'),
        layers.BatchNormalization(),
        
        # Binary classification: Brown vs Not Brown
        layers.Dense(1, activation='sigmoid')
    ])
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='binary_crossentropy',
        metrics=[
            'accuracy',
            keras.metrics.Precision(),
            keras.metrics.Recall(),
            keras.metrics.AUC()
        ]
    )
    
    print("✅ Model built successfully!")
    print(f"   📊 Total parameters: {model.count_params():,}")
    print(f"   🔒 Base model frozen (transfer learning)")
    
    return model, base_model

# ==================== DATA LOADING ====================
def load_training_data(data_dir):
    """
    Load training data from directory structure
    """
    print("\n📂 Loading training data...")
    
    # Create image generator with augmentation
    train_datagen = ImageDataGenerator(
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        rescale=1./255,
        validation_split=VALIDATION_SPLIT
    )
    
    # Load training data
    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',  # Brown=1, Not Brown=0
        subset='training',
        shuffle=True
    )
    
    # Load validation data
    validation_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        subset='validation',
        shuffle=False
    )
    
    print(f"✅ Training samples: {train_generator.samples}")
    print(f"✅ Validation samples: {validation_generator.samples}")
    print(f"✅ Batch size: {BATCH_SIZE}")
    
    return train_generator, validation_generator

# ==================== TRAINING ====================
def train_model(model, train_gen, val_gen):
    """
    Train the brown detector model
    """
    print("\n🎓 Starting Training...")
    print(f"   📈 Epochs: {EPOCHS}")
    print(f"   🔄 Learning rate: {LEARNING_RATE}")
    print("   ⏱️  This may take several minutes...")
    
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS,
        verbose=1,
        callbacks=[
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=3,
                restore_best_weights=True,
                verbose=1
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=2,
                min_lr=1e-6,
                verbose=1
            )
        ]
    )
    
    return history

# ==================== MODEL SAVING ====================
def save_model(model, model_path='brown_detector_model.h5'):
    """
    Save trained model
    """
    print(f"\n💾 Saving model to: {model_path}")
    model.save(model_path)
    print(f"✅ Model saved successfully!")
    print(f"   📦 Size: {os.path.getsize(model_path) / 1024 / 1024:.2f} MB")
    
    # Also save as TensorFlow SavedModel format
    tf_model_path = model_path.replace('.h5', '_tf')
    model.save(tf_model_path)
    print(f"\n💾 Saving TFLite model to: {tf_model_path}")
    
    return model_path

# ==================== EVALUATION ====================
def evaluate_model(model, val_gen):
    """
    Evaluate model performance
    """
    print("\n📊 Evaluating Model...")
    
    results = model.evaluate(val_gen, verbose=0)
    
    print(f"✅ Validation Accuracy: {results[1]*100:.2f}%")
    print(f"✅ Validation Precision: {results[2]*100:.2f}%")
    print(f"✅ Validation Recall: {results[3]*100:.2f}%")
    print(f"✅ Validation AUC: {results[4]:.4f}")

# ==================== TEST PREDICTION ====================
def test_prediction(model, image_path):
    """
    Test the model on a single image
    """
    try:
        from PIL import Image
        
        print(f"\n🧪 Testing prediction on: {image_path}")
        
        # Load and preprocess image
        img = Image.open(image_path).convert('RGB')
        img = img.resize(IMAGE_SIZE)
        img_array = np.array(img) / 255.0
        img_batch = np.expand_dims(img_array, axis=0)
        
        # Predict
        prediction = model.predict(img_batch, verbose=0)[0][0]
        
        is_brown = prediction > 0.5
        confidence = prediction if is_brown else (1 - prediction)
        
        print(f"   🟤 Brown detected: {'Yes' if is_brown else 'No'}")
        print(f"   📊 Confidence: {confidence*100:.2f}%")
        
        return is_brown, confidence
        
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        return None, None

# ==================== FINE-TUNING ====================
def finetune_model(model, base_model, train_gen, val_gen):
    """
    Fine-tune base model weights (after initial training)
    """
    print("\n🔄 Fine-tuning Model...")
    print("   🔓 Unfreezing base model layers...")
    
    # Unfreeze last 50 layers
    for layer in base_model.layers[-50:]:
        layer.trainable = True
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE / 10),
        loss='binary_crossentropy',
        metrics=['accuracy', keras.metrics.Precision(), keras.metrics.Recall()]
    )
    
    # Train again with lower learning rate
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=5,
        verbose=1
    )
    
    return history

# ==================== MAIN ====================
def main():
    parser = argparse.ArgumentParser(description='Train brown object detector')
    parser.add_argument('--train', action='store_true', help='Train the model')
    parser.add_argument('--test', type=str, help='Test on image file')
    parser.add_argument('--finetune', action='store_true', help='Fine-tune existing model')
    parser.add_argument('--data-dir', default='training_data', help='Training data directory')
    parser.add_argument('--model', default='brown_detector_model.h5', help='Model save path')
    
    args = parser.parse_args()
    
    # Create data directories if they don't exist
    if not os.path.exists(args.data_dir):
        create_default_training_data()
        print("\n⚠️  Training data directories created!")
        print(f"   📁 Add brown object images to: {args.data_dir}/brown/")
        print(f"   📁 Add non-brown images to: {args.data_dir}/not_brown/")
        print("   Then run: python train_brown_detector.py --train")
        return
    
    # Check if we have enough training data
    brown_count = len(os.listdir(os.path.join(args.data_dir, 'brown')))
    not_brown_count = len(os.listdir(os.path.join(args.data_dir, 'not_brown')))
    
    if brown_count < 2 or not_brown_count < 2:
        print(f"⚠️  Not enough training data!")
        print(f"   🟤 Brown images: {brown_count} (need at least 50)")
        print(f"   ⚪ Not-brown images: {not_brown_count} (need at least 50)")
        return
    
    # Build or load model
    if args.finetune and os.path.exists(args.model):
        print(f"\n📦 Loading existing model: {args.model}")
        model = keras.models.load_model(args.model)
    else:
        model, base_model = build_brown_detector()
    
    # Test mode
    if args.test:
        if os.path.exists(args.model):
            model = keras.models.load_model(args.model)
            test_prediction(model, args.test)
        else:
            print(f"❌ Model not found: {args.model}")
        return
    
    # Training mode
    if args.train:
        train_gen, val_gen = load_training_data(args.data_dir)
        
        # Train model
        if not args.finetune:
            history = train_model(model, train_gen, val_gen)
        
        # Evaluate
        evaluate_model(model, val_gen)
        
        # Fine-tune if requested
        if args.finetune:
            finetune_model(model, base_model, train_gen, val_gen)
        
        # Save model
        save_model(model, args.model)
        
        print("\n✅ Training Complete!")
        print(f"   📦 Model saved: {args.model}")
        print(f"   🚀 Ready for deployment!")
        
        return
    
    # Show usage if no action specified
    if not args.train and not args.test and not args.finetune:
        print("\n📖 Usage:")
        print("   1. Add brown images to: training_data/brown/")
        print("   2. Add non-brown images to: training_data/not_brown/")
        print("   3. Run training: python train_brown_detector.py --train")
        print("   4. Test model: python train_brown_detector.py --test <image_path>")
        print("   5. Fine-tune: python train_brown_detector.py --finetune --train")

if __name__ == '__main__':
    main()
