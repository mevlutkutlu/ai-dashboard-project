import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LogoutButton from "./LogoutButton";


export default function DynamicForm() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const handleCopy = () => {
  navigator.clipboard.writeText(response)
    .then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2 saniye sonra geri eski haline dönsün
    })
    .catch(() => alert("Kopyalama başarısız oldu."));
};

const [copied, setCopied] = useState(false);



  useEffect(() => {
    fetch(`http://localhost:8000/api/templates/${templateId}`)
      .then((res) => res.json())
      .then((data) => {
        setTemplate(data);
      });
  }, [templateId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
  setLoading(true);

  const token = localStorage.getItem("token");  // token'ı çekiyoruz

  const res = await fetch("http://localhost:8000/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`  // token header'a eklendi
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
      <LogoutButton />
      <h2 className="mb-4 text-center">{template.name}</h2>

      {template.inputs.map((input, index) => (
        <div key={index} className="mb-3">
          <label className="form-label">{input.label}</label>
          {input.type === "select" ? (
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
          <button className="btn btn-sm btn-outline-primary mt-2" onClick={handleCopy}>
                {copied ? "Kopyalandı ✅" : "Kopyala"}
          </button>

        </div>
)}

    </div>
  );
}
