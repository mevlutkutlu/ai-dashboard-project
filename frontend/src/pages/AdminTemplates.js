import React, { useEffect, useState } from "react";

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
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
    console.log("Form.inputs:", form.inputs);
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
      console.log("HATA:", data);
      alert(data.detail || JSON.stringify(data) || "Hata oluştu");

    }
  };

  return (
    <div className="container mt-5">
      <h2>Şablonları Yönet</h2>

      <h4 className="mt-4">Yeni Şablon Ekle</h4>
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
          rows={5}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <textarea
          name="prompt_template"
          className="form-control"
          placeholder="Prompt şablonu"
          value={form.prompt_template}
          rows={4}
          onChange={handleChange}
        />
      </div>
      <button className="btn btn-success" onClick={handleSubmit}>
        Kaydet
      </button>

      <h4 className="mt-5">Mevcut Şablonlar</h4>
      <ul className="list-group mt-3">
        {templates.map((t) => (
          <li className="list-group-item" key={t.id}>
            <strong>{t.name}</strong> — <code>{t.identifier}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
