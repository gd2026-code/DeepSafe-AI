import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://deepsafe-backend-kpie.onrender.com";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password || !confirm) {
      return setError("All fields required");
    }

    if (password !== confirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      // ✅ FIX: inside function
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        body: formData,
      });

      console.log("STATUS:", res.status);

      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      const data = JSON.parse(text);

      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      alert("Registered successfully!");
      navigate("/login");

    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={bg}>
      <div style={card}>

        <div style={logo}>DS</div>

        <h2>Create Account</h2>
        <p style={{ color: "#94a3b8" }}>Join DeepSafe Platform</p>

        <form onSubmit={handleSubmit}>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={input}
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button style={btn} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        <p onClick={() => navigate("/login")} style={link}>
          Already have an account? Login
        </p>

      </div>
    </div>
  );
};

const bg = {
  background: "linear-gradient(135deg,#0f172a,#020617)",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "white"
};

const card = {
  width: "400px",
  padding: "40px",
  borderRadius: "20px",
  background: "rgba(30,41,59,0.8)",
  backdropFilter: "blur(10px)",
  textAlign: "center"
};

const logo = {
  width: "60px",
  height: "60px",
  margin: "auto",
  borderRadius: "12px",
  background: "#3b82f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  marginBottom: "15px"
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "none",
  background: "#334155",
  color: "white"
};

const btn = {
  width: "100%",
  padding: "12px",
  background: "#3b82f6",
  border: "none",
  borderRadius: "10px",
  color: "white",
  cursor: "pointer"
};

const link = {
  marginTop: "15px",
  color: "#60a5fa",
  cursor: "pointer"
};

export default Register;