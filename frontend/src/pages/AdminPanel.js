import React, { useEffect, useState } from "react";
import "./AdminTemplates.css";

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [listVisible, setListVisible] = useState(false);
  const [form, setForm] = useState({
    name: "",
    identifier: "",
    inputs: "",
    prompt_template: "",
  });

  const token = localStorage.getItem("token");

  const fetchTemplates = () => {
    fetch("http://localhost:8000/api/templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data));
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      inputs: JSON.parse(form.inputs),
    };

    const res = await fetch("http://localhost:8000/api/templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Şablon eklendi");
      setForm({
        name: "",
        identifier: "",
        inputs: "",
        prompt_template: "",
      });
      fetchTemplates();
    } else {
      const data = await res.json();
      alert(data.detail || JSON.stringify(data) || "Hata oluştu");
    }
  };

  const handleDelete = async (identifier) => {
    if (!window.confirm("Bu şablonu silmek istediğine emin misin?")) return;

    const res = await fetch(`http://localhost:8000/api/templates/${identifier}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      alert("Şablon silindi");
      fetchTemplates();
    } else {
      const data = await res.json();
      alert(data.detail || "Silme başarısız oldu.");
    }
  };

  return (
    <div className="container mt-5 text-white">
      <div className="bg-warning text-dark p-4 rounded shadow d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Şablonları Yönet</h2>
          <p className="mb-0">Şablonları buradan ekleyip kaldırabilirsin.</p>
        </div>
        <button
          className="btn btn-outline-dark"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          Oturumu Kapat
        </button>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card bg-light text-dark shadow">
            <div className="card-body">
              <h5 className="card-title">Yeni Şablon Ekle</h5>
              <p className="card-text">AI şablonlarını sisteme tanımla.</p>
              <button className="btn btn-warning" onClick={() => setFormVisible(!formVisible)}>
                {formVisible ? "Şablon Ekleme Alanını Gizle" : "Şablon Ekle"}
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card bg-light text-dark shadow">
            <div className="card-body">
              <h5 className="card-title">Mevcut Şablonlar</h5>
              <p className="card-text">Var olan şablonları görüntüle veya sil.</p>
              <button className="btn btn-info" onClick={() => setListVisible(!listVisible)}>
                {listVisible ? "Şablonları Gizle" : "Göster"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`transition-box mt-4 ${formVisible ? "show" : ""}`}>
        <div className="card bg-light text-dark p-4 shadow">
          <div className="mb-3">
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Şablon Adı"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              name="identifier"
              className="form-control"
              placeholder="Identifier (örn: blog_post_generator)"
              value={form.identifier}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <textarea
              name="inputs"
              className="form-control"
              placeholder='Input alanları (JSON formatında gir, örn: [{"label":"Konu",...}])'
              value={form.inputs}
              rows={4}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <textarea
              name="prompt_template"
              className="form-control"
              placeholder="Prompt şablonu"
              value={form.prompt_template}
              rows={3}
              onChange={handleChange}
            />
          </div>
          <button className="btn btn-success" onClick={handleSubmit}>
            Kaydet
          </button>
        </div>
      </div>

      <div className={`transition-box mt-4 ${listVisible ? "show" : ""}`}>
        <div className="card bg-light text-dark p-4 shadow">
          <h5 className="card-title">Tanımlı Şablonlar</h5>
          <ul className="list-group mt-3">
            {templates.map((t) => (
              <li
                key={t.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{t.name}</strong> — <code>{t.identifier}</code>
                </div>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(t.identifier)}
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
