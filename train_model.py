import os
import cv2
import numpy as np
from skimage.feature import hog
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
import joblib

# ============================
# FEATURE EXTRACTION
# ============================

def extract_features(image):
    image = cv2.resize(image, (224, 224))

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    hog_features = hog(
        gray,
        orientations=9,
        pixels_per_cell=(16, 16),
        cells_per_block=(2, 2),
        block_norm="L2-Hys"
    )

    hist = cv2.calcHist(
        [image],
        [0, 1, 2],
        None,
        [8, 8, 8],
        [0, 256, 0, 256, 0, 256]
    ).flatten()

    return np.hstack([hog_features, hist])


# ============================
# DATASET PATHS
# ============================

real_path = r"dataset\Real\real"
fake_path = r"dataset\fake\FAKE IMAGES"

X = []
y = []

# ============================
# LOAD REAL IMAGES
# ============================

print("Loading REAL images...")

for img_name in os.listdir(real_path):
    img_path = os.path.join(real_path, img_name)

    img = cv2.imread(img_path)

    if img is not None:
        features = extract_features(img)
        X.append(features)
        y.append(0)

# ============================
# LOAD FAKE IMAGES
# ============================

print("Loading FAKE images...")

for img_name in os.listdir(fake_path):
    img_path = os.path.join(fake_path, img_name)

    img = cv2.imread(img_path)

    if img is not None:
        features = extract_features(img)
        X.append(features)
        y.append(1)

# ============================
# CONVERT TO NUMPY
# ============================

X = np.array(X)
y = np.array(y)

print(f"Total Samples: {len(X)}")

if len(X) == 0:
    print("❌ No images found.")
    exit()

# ============================
# SCALE FEATURES
# ============================

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)

# ============================
# TRAIN TEST SPLIT
# ============================

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled,
    y,
    test_size=0.2,
    random_state=42
)

# ============================
# TRAIN MODEL
# ============================

print("Training model...")

model = SVC(
    kernel="rbf",
    probability=True
)

model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)

print(f"Accuracy: {accuracy * 100:.2f}%")

# ============================
# SAVE MODEL
# ============================

os.makedirs("models", exist_ok=True)

joblib.dump(model, "models/deepfake_model.pkl")
joblib.dump(scaler, "models/scaler.pkl")

print("✅ Model saved successfully!")
print("✅ Scaler saved successfully!")