import React, { useState } from "react";
import ResultsSection from "./ResultsSection";

const API_BASE_URL = "http://127.0.0.1:8000";

const UploadSection = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];

    if (!f) return;

    if (f.name.toLowerCase().endsWith(".heic")) {
      alert("HEIC format not supported. Please upload JPG, PNG or MP4.");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Upload file first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const endpoint = file.type.startsWith("video")
        ? "/predict-video"
        : "/predict";

      const res = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      const data = JSON.parse(text);

      console.log("Real:", data.real_score);
      console.log("Fake:", data.fake_score);

      if (!res.ok) {
        throw new Error(data.error || "Prediction failed");
      }

      setResult({
        verdict: data.verdict,
        confidence: data.confidence,

        real_score: data.real_score,
        fake_score: data.fake_score,

        frames_analyzed:
          data.frames_analyzed || null,

        pieData: [
          {
            name: "Real",
            value: data.real_score,
          },
          {
            name: "Fake",
            value: data.fake_score,
          },
        ],

        models: {
          HOG_SVM: data.confidence,
        },
      });

    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={bg}>

      {/* HEADER */}
      <div style={header}>
        <h1>DeepSafe</h1>

        <button
          style={logout}
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>

      {/* HERO */}
      <div
        style={{
          textAlign: "center",
          marginTop: "40px",
        }}
      >
        <h1>
          Detect Deepfakes with Enterprise Precision
        </h1>

        <p style={{ color: "#94a3b8" }}>
          Upload image or video for analysis
        </p>
      </div>

      {/* UPLOAD CARD */}
      <div style={box}>

        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
        />

        {preview && (
          <div
            style={{
              marginTop: "20px",
              height: "320px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#0f172a",
              borderRadius: "12px",
              overflow: "hidden",
              padding: "10px",
              border: "1px solid #334155",
            }}
          >

            {file?.type.startsWith("image") && (
              <img
                src={preview}
                alt="preview"
                style={media}
              />
            )}

            {file?.type.startsWith("video") && (
              <video
                src={preview}
                controls
                style={media}
              />
            )}

          </div>
        )}

        <button
          onClick={handleUpload}
          style={btn}
        >
          Run DeepSafe
        </button>

      </div>

      {/* RESULTS */}
      {result && (
        <ResultsSection result={result} />
      )}

    </div>
  );
};

const bg = {
  background: "#0f172a",
  minHeight: "100vh",
  color: "white",
  padding: "30px",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const logout = {
  background: "red",
  border: "none",
  padding: "10px 15px",
  borderRadius: "8px",
  color: "white",
  cursor: "pointer",
};

const box = {
  maxWidth: "700px",
  margin: "40px auto",
  padding: "30px",
  background: "#1e293b",
  borderRadius: "20px",
  textAlign: "center",
};

const media = {
  maxWidth: "100%",
  maxHeight: "300px",
  objectFit: "contain",
  borderRadius: "12px",
};

const btn = {
  marginTop: "20px",
  padding: "12px",
  width: "100%",
  background: "#3b82f6",
  border: "none",
  borderRadius: "10px",
  color: "white",
  cursor: "pointer",
  fontSize: "16px",
};

export default UploadSection;