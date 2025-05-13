import React from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <button className="btn btn-outline-danger mb-4" onClick={handleLogout}>
      Oturumu Kapat
    </button>
  );
}
