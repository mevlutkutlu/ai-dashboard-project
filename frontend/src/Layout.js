import React from "react";
import { useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const email = localStorage.getItem("user_email");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    navigate("/");
  };

  return (
    <>
      {/* 🟨 Üst Sarı Bar */}
      <div
        style={{
          backgroundColor: "#ffc107", // Sarı
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ccc",
        }}
      >
        <span className="fw-bold text-dark">
          Hoş geldin, {email || "Kullanıcı"} 👋
        </span>
        <button onClick={handleLogout} className="btn btn-dark btn-sm">
          Oturumu Kapat
        </button>
      </div>

      {/* Diğer içerikler */}
      <div className="container py-4">{children}</div>
    </>
  );
}
