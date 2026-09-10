import os

import tensorflow as tf
from tensorflow.keras import layers, models

DATA = os.path.join(os.path.dirname(__file__), "dataset", "train")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "agrovision_model.keras")
CLASSES_PATH = os.path.join(MODEL_DIR, "classes.txt")

IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 12
LEARNING_RATE = 0.0005

if not os.path.isdir(DATA):
    raise FileNotFoundError(f"Dataset path not found: {DATA}. Run download_dataset.py first.")

class_dirs = [d for d in os.scandir(DATA) if d.is_dir()]
if not class_dirs:
    raise ValueError(f"Dataset is empty at {DATA}. Download a valid plant disease dataset first.")

print(f"Dataset path: {DATA}")
print(f"Class count: {len(class_dirs)}")
print(f"Classes: {[entry.name for entry in class_dirs]}")

image_count = 0
for root, _, files in os.walk(DATA):
    image_count += sum(1 for name in files if name.lower().endswith((".jpg", ".jpeg", ".png", ".webp")))
print(f"Image count: {image_count}")

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATA,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int",
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATA,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int",
)

class_names = train_ds.class_names
print(f"Training classes: {len(class_names)}")

os.makedirs(MODEL_DIR, exist_ok=True)
with open(CLASSES_PATH, "w", encoding="utf-8") as handle:
    for class_name in class_names:
        handle.write(class_name + "\n")

AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)

augmentation = models.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
])

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet",
)
base_model.trainable = False

model = models.Sequential([
    augmentation,
    layers.Rescaling(1.0 / 255),
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.3),
    layers.Dense(len(class_names), activation="softmax", name="output_layer"),
])

optimizer = tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE)
model.compile(
    optimizer=optimizer,
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

model.summary()

history = model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS)
val_accuracy = max(history.history.get("val_accuracy", [0.0]))

model.save(MODEL_PATH)
print(f"Validation accuracy: {val_accuracy:.4f}")
print(f"Model saved to: {MODEL_PATH}")
print("Training complete.")
