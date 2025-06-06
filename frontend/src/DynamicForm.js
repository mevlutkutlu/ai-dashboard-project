import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import jsPDF from "jspdf"; // 💥 PDF için eklendi
import { useNavigate } from "react-router-dom";

export default function DynamicForm() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate(); // 👈 eklendi

  const handleCopy = () => {
    navigator.clipboard.writeText(response)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => alert("Kopyalama başarısız oldu."));
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(response, 180); // 180 genişliğe göre satır böl
    doc.text(lines, 10, 10);
    doc.save("ai-output.pdf");
  };

  useEffect(() => {
    fetch(`http://localhost:8000/api/templates/by-identifier/${templateId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Template verisi:", data);
        setTemplate(data);
      });
  }, [templateId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:8000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        template_id: templateId,
        fields: formData,
      }),
    });

    const data = await res.json();
    setResponse(data.result || data.error);
    setLoading(false);
  };

  if (!template) return <p>Yükleniyor...</p>;

  return (
    
    
    <div className="container mt-5">
      <button className="btn btn-secondary mt-3" onClick={() => navigate("/home")}>
          ⬅ Geri Dön
        </button>
      
      <h2 className="mb-4 text-center">{template.name}</h2>

      {template.inputs?.map((input, index) => (
        <div key={index} className="mb-3">
          <label className="form-label">{input.label}</label>
          {(input.type || "text") === "select" ? (
            <select
              className="form-select"
              name={input.name}
              onChange={handleChange}
            >
              <option value="">Seçiniz</option>
              {input.options.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="form-control"
              name={input.name}
              onChange={handleChange}
            />
          )}
        </div>
      ))}

      <button className="btn btn-primary w-100" onClick={handleSubmit} disabled={loading}>
        {loading ? "Yapay zekâ yazıyor..." : "Gönder"}
      </button>

      {response && (
        <div className="alert alert-secondary mt-4" role="alert">
          <pre>{response}</pre>
          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-sm btn-outline-primary" onClick={handleCopy}>
              {copied ? "Kopyalandı ✅" : "Kopyala"}
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={handleDownloadPDF}>
              PDF indir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
