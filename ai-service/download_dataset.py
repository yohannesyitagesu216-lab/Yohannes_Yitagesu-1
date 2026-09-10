import os
import shutil
import sys

try:
    import kagglehub
except Exception as exc:  # pragma: no cover - runtime dependency may be missing
    print(f"Missing dependency: {exc}")
    print("Install with: pip install kagglehub")
    raise SystemExit(1)

DATASET_DEST = os.path.join(os.path.dirname(__file__), "dataset", "train")
DATASET_ROOT = os.path.dirname(__file__)

if os.path.isdir(DATASET_DEST) and any(os.scandir(DATASET_DEST)):
    print("Dataset already exists. Skipping download.")
    raise SystemExit(0)

print("Downloading dataset...")

try:
    dataset_path = kagglehub.dataset_download("vipoooool/new-plant-diseases-dataset")
except Exception as exc:
    print(f"Dataset download failed: {exc}")
    raise SystemExit(1)

train_source = None
for root, dirs, _ in os.walk(dataset_path):
    if "train" in dirs:
        train_source = os.path.join(root, "train")
        break

if not train_source or not os.path.isdir(train_source):
    print(f"Downloaded dataset structure was unexpected: {dataset_path}")
    raise SystemExit(1)

print(f"Extracting dataset to {DATASET_DEST}")
os.makedirs(DATASET_DEST, exist_ok=True)
shutil.copytree(train_source, DATASET_DEST, dirs_exist_ok=True)

class_count = sum(1 for entry in os.scandir(DATASET_DEST) if entry.is_dir())
image_count = 0
for root, _, files in os.walk(DATASET_DEST):
    image_count += sum(1 for name in files if name.lower().endswith((".jpg", ".jpeg", ".png", ".webp")))

print(f"Dataset ready. Classes: {class_count} | Images: {image_count}")
print("Dataset validation complete.")