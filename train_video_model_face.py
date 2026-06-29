import os
import cv2
import joblib
import numpy as np

from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from skimage.feature import hog

# ==========================
# DATASET PATHS
# ==========================

REAL_DIR = "video_dataset/real"
FAKE_DIR = "video_dataset/fake"

# ==========================
# FACE DETECTOR
# ==========================

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
)

# ==========================
# FACE FEATURE EXTRACTION
# ==========================

def extract_video_features(video_path):

    cap = cv2.VideoCapture(video_path)

    features_list = []

    frame_count = 0

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        if frame_count % 10 == 0:

            gray = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2GRAY
            )

            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(50, 50)
            )

            if len(faces) > 0:

                x, y, w, h = max(
                    faces,
                    key=lambda f: f[2] * f[3]
                )

                face = gray[
                    y:y+h,
                    x:x+w
                ]

                face = cv2.resize(
                    face,
                    (128, 128)
                )

                hog_features = hog(
                    face,
                    orientations=9,
                    pixels_per_cell=(8, 8),
                    cells_per_block=(2, 2),
                    block_norm="L2-Hys"
                )

                features_list.append(
                    hog_features
                )

        frame_count += 1

        if len(features_list) >= 20:
            break

    cap.release()

    if len(features_list) == 0:
        return None

    return np.mean(
        features_list,
        axis=0
    )

# ==========================
# LOAD DATASET
# ==========================

X = []
y = []

print("Loading REAL videos...")

for file in os.listdir(REAL_DIR):

    path = os.path.join(
        REAL_DIR,
        file
    )

    features = extract_video_features(
        path
    )

    if features is not None:
        X.append(features)
        y.append(0)

print("Loading FAKE videos...")

for file in os.listdir(FAKE_DIR):

    path = os.path.join(
        FAKE_DIR,
        file
    )

    features = extract_video_features(
        path
    )

    if features is not None:
        X.append(features)
        y.append(1)

X = np.array(X)
y = np.array(y)

print("Total Videos:", len(X))

# ==========================
# SPLIT
# ==========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# ==========================
# SCALE
# ==========================

scaler = StandardScaler()

X_train = scaler.fit_transform(
    X_train
)

X_test = scaler.transform(
    X_test
)

# ==========================
# TRAIN
# ==========================

print("Training Face Video Model...")

model = SVC(
    kernel="rbf",
    C=10,
    probability=True
)

model.fit(
    X_train,
    y_train
)

# ==========================
# EVALUATE
# ==========================

predictions = model.predict(
    X_test
)

accuracy = accuracy_score(
    y_test,
    predictions
)

print(
    f"Video Accuracy: {accuracy*100:.2f}%"
)

# ==========================
# SAVE
# ==========================

joblib.dump(
    model,
    "models/video_model_face.pkl"
)

joblib.dump(
    scaler,
    "models/video_scaler_face.pkl"
)

print(
    "✅ video_model_face.pkl saved"
)

print(
    "✅ video_scaler_face.pkl saved"
)