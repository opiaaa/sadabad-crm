"use client";
import { useEffect, useState } from "react";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    address: "",
    district: "",
    area: "",
    price: "",
    listingType: "SATILIK",
    propertyType: "KONUT",
    ownerName: "",
    ownerPhone: "",
  });

  function load() {
    fetch("/api/properties").then((r) => r.json()).then(setProperties);
  }
  useEffect(load, []);

  async function addProperty(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/properties", {
      method: "POST",
      body: JSON.stringify({ ...form, area: Number(form.area), price: Number(form.price) }),
    });
    setForm({ ...form, title: "", address: "", district: "", area: "", price: "", ownerName: "", ownerPhone: "" });
    load();
  }

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 16 }}>
      <h1>Portföy</h1>

      <form onSubmit={addProperty} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <input placeholder="Başlık" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input placeholder="Adres" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        <input placeholder="Bölge/Mahalle" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required />
        <input placeholder="m²" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required />
        <input placeholder="Fiyat" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input placeholder="Sahibi" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} required />
        <input placeholder="Sahibi Tel" value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} required />
        <button type="submit">Ekle</button>
      </form>

      <table width="100%" cellPadding={8} style={{ background: "#fff" }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Başlık</th>
            <th>Bölge</th>
            <th>m²</th>
            <th>Fiyat</th>
            <th>Durum</th>
            <th>Eklenme Tarihi</th>
            <th>İlan sahibi (danışman)</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.district}</td>
              <td>{p.area}</td>
              <td>{p.price.toLocaleString("tr-TR")} ₺</td>
              <td>{p.status}</td>
              <td>{new Date(p.createdAt).toLocaleDateString("tr-TR")}</td>
              <td>{p.listingAgent?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
