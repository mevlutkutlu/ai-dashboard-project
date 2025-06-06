import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/home");
          }
        });
    }
  }, [navigate]);

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.access_token);

        const meRes = await fetch("http://localhost:8000/me", {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });

        const meData = await meRes.json();
        localStorage.setItem("user_email", meData.email);
        localStorage.setItem("user_role", meData.role);

        if (meData.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        setError(data.detail || "Giriş başarısız.");
      }
    } catch (err) {
      setError("Sunucu hatası.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h2 className="mb-4">Giriş Yap</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="btn btn-primary w-100" onClick={handleLogin}>
        Giriş Yap
      </button>
    </div>
  );
}
