import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import UploadSection from "./components/UploadSection";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
  };

  return (
    <Router>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login onLogin={handleLogin} />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register onLogin={handleLogin} />}
        />

        {/* UPLOAD (PROTECTED) */}
        <Route
          path="/upload"
          element={
            token ? (
              <UploadSection onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* DEFAULT */}
        <Route
          path="*"
          element={<Navigate to="/login" />}
        />

      </Routes>
    </Router>
  );
}

export default App;