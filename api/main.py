import os
import joblib
import numpy as np
import time
import uuid

from fastapi import FastAPI, HTTPException, Depends, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import init_db, get_db, AnalysisHistory

from deepsafe_utils.video_analyzer import extract_frames

from deepsafe_utils.feature_extractor import (
    extract_features_from_bytes,
    extract_features_from_frame
)

# ---------------- APP ----------------
app = FastAPI(title="DeepSafe API")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- INIT DB ----------------
init_db()

# ---------------- USER DB ----------------
fake_users_db = {}

# ---------------- LOAD MODEL ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models")

scaler = joblib.load(os.path.join(MODEL_PATH, "scaler.pkl"))
model = joblib.load(os.path.join(MODEL_PATH, "deepfake_model.pkl"))

# ---------------- HEALTH ----------------
@app.get("/health")
def health():
    return {"status": "ok"}

# ---------------- PREDICT ----------------
# ---------------- PREDICT ----------------
@app.post("/predict")
async def predict(file: UploadFile = File(...), db: Session = Depends(get_db)):
    start_time = time.time()

    try:
        contents = await file.read()

        # Feature extraction
        features = extract_features_from_bytes(contents)

        # Scale features
        features_scaled = scaler.transform(features)

        # Predict class
        prediction = model.predict(features_scaled)[0]

        # Predict probabilities
        try:
            prob = model.predict_proba(features_scaled)[0]

            real_score = float(prob[0])
            fake_score = float(prob[1])

        except Exception:
            real_score = 1.0 if prediction == 0 else 0.0
            fake_score = 1.0 if prediction == 1 else 0.0

        # Final verdict
        verdict = "real" if prediction == 0 else "fake"

        # Convert to percentage
        confidence = round(max(real_score, fake_score) * 100, 2)
        real_percent = round(real_score * 100, 2)
        fake_percent = round(fake_score * 100, 2)

        # Save result to database
        record = AnalysisHistory(
            request_id=str(uuid.uuid4()),
            username="test_user",
            media_type="image",
            media_name=file.filename,
            verdict=verdict,
            confidence=confidence,
            ensemble_method="HOG_SVM",
            ensemble_score=confidence,
            inference_time=time.time() - start_time,
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        return {
            "verdict": verdict,
            "confidence": confidence,
            "real_score": real_percent,
            "fake_score": fake_percent
        }

    except Exception as e:
        return {
            "error": str(e)
        }
    
@app.post("/predict-video")
async def predict_video(file: UploadFile = File(...)):

    try:

        contents = await file.read()

        frames = extract_frames(
            contents,
            frame_skip=5
        )

        if len(frames) == 0:
            raise Exception(
                "No frames extracted"
            )

        fake_probs = []

        for frame in frames:

            features = extract_features_from_frame(
                frame
            )

            features_scaled = scaler.transform(
                features
            )

            prob = model.predict_proba(
                features_scaled
            )[0]

            fake_probability = float(
                prob[1]
            )

            fake_probs.append(
                fake_probability
            )

        avg_fake_prob = np.mean(
            fake_probs
        )

        fake_percent = round(
            avg_fake_prob * 100,
            2
        )

        real_percent = round(
            (1 - avg_fake_prob) * 100,
            2
        )

        # Better decision logic

        if fake_percent >= 70:

            verdict = "fake"

            confidence = fake_percent

        elif fake_percent >= 40:

            verdict = "suspicious"

            confidence = fake_percent

        else:

            verdict = "real"

            confidence = real_percent

        return {

            "verdict": verdict,

            "confidence": confidence,

            "real_score": real_percent,

            "fake_score": fake_percent,

            "frames_analyzed": len(frames)
        }

    except Exception as e:

        return {
            "error": str(e)
        }
# ---------------- REGISTER ----------------
@app.post("/register")
def register(username: str = Form(...), password: str = Form(...)):

    if username in fake_users_db:
        raise HTTPException(status_code=400, detail="User already exists")

    fake_users_db[username] = {
        "username": username,
        "password": password,
    }

    return {
        "access_token": "dummy_token",
        "token_type": "bearer"
    }

# ---------------- LOGIN ----------------
@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):

    user = fake_users_db.get(username)

    if not user:
        raise HTTPException(status_code=400, detail="Invalid username")

    if password != user["password"]:
        raise HTTPException(status_code=400, detail="Invalid password")

    return {
        "access_token": "dummy_token",
        "token_type": "bearer"
    }