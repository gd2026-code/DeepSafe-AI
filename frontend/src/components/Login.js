import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      onLogin(data.access_token);
      navigate("/upload");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #0f172a, #020617)",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white"
    }}>

      <div style={{
        width: "400px",
        padding: "40px",
        borderRadius: "20px",
        background: "rgba(30, 41, 59, 0.8)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 0 40px rgba(0,0,0,0.6)"
      }}>

        {/* 🔵 LOGO */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{
            width: "60px",
            height: "60px",
            margin: "auto",
            borderRadius: "15px",
            background: "#3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "20px"
          }}>
            DS
          </div>
        </div>

        <h2 style={{ textAlign: "center" }}>Welcome Back</h2>
        <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "20px" }}>
          Sign in to access DeepSafe
        </p>

        <form onSubmit={handleSubmit}>

          <input
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button style={buttonStyle} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <p
          onClick={() => navigate("/register")}
          style={{
            textAlign: "center",
            marginTop: "15px",
            color: "#60a5fa",
            cursor: "pointer"
          }}
        >
          Don't have an account? Register
        </p>

      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "none",
  background: "#334155",
  color: "white"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#3b82f6",
  border: "none",
  borderRadius: "10px",
  color: "white",
  cursor: "pointer"
};

export default Login;