import React, { useEffect, useState } from "react";

export default function HistoryList() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/history", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Yükleniyor...</p>;
  if (!history.length) return <p>Henüz geçmiş yok.</p>;

  return (
    <div className="container mt-4">
      <h3>Geçmiş</h3>
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
    </div>
  );
}
