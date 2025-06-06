import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function HistoryList() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 👈 eklendi

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-5">Yükleniyor...</p>;
  if (!history.length) {
    return (
      <div className="container mt-5 text-center">
        <p>Henüz geçmiş yok.</p>
        <button className="btn btn-outline-secondary mt-3" onClick={() => navigate("/home")}>
          ⬅ Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-4">Geçmiş</h3>
      {history.map((item, index) => (
        <div key={index} className="card mb-3 p-3">
          <small className="text-muted">{item.created_at}</small>
          <p><strong>Şablon:</strong> {item.template_id}</p>
          <p><strong>Input:</strong></p>
          <ul>
            {Object.entries(item.input_fields).map(([key, value]) => (
              <li key={key}><strong>{key}:</strong> {value}</li>
            ))}
          </ul>
          <p><strong>Yanıt:</strong></p>
          <pre>{item.output_text}</pre>
        </div>
      ))}

      <div className="text-center mt-4">
        <button className="btn btn-secondary" onClick={() => navigate("/home")}>
          ⬅ Geri Dön
        </button>
      </div>
    </div>
  );
}
