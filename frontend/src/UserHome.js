import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import './App.css';


export default function UserHome() {
  const [user, setUser] = useState(null);
  const [templates, setTemplates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:8000/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => navigate("/login"));

    fetch("http://localhost:8000/api/templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data));
  }, []);

  if (!user) return <p>Yükleniyor...</p>;

  return (

    <Layout>
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h3 className="text-white">Kullanmak istediğin bir şablon seç.</h3>
      </div>

      <div className="row g-4">
        {templates.map((template) => (
          <div key={template.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{template.name}</h5>
                <button
                  className="btn btn-mor mt-auto"
                  onClick={() => navigate(`/dashboard/${template.identifier}`)}
                >
                  Kullan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 text-center">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/history")}
        >
          Geçmişi Görüntüle
        </button>
      </div>
    </div>
    </Layout>
  );
}
