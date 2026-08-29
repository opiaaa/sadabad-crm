"use client";
import { useEffect, useState } from "react";

const STAGES: Record<string, string> = {
  YENI: "Yeni",
  GORUSULDU: "Görüşüldü",
  GOSTERIM: "Gösterim yapıldı",
  TEKLIF: "Teklif",
  KAPANDI_KAZANILDI: "Kazanıldı",
  KAPANDI_KAYIP: "Kaybedildi",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    listingType: "SATILIK",
    propertyType: "KONUT",
    preferredArea: "",
  });

  function load() {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []));
  }
  useEffect(load, []);

  async function addLead(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/leads", { method: "POST", body: JSON.stringify(form) });
    const data = await res.json();
    if (data?.duplicateWarning) {
      alert("Bu telefon numarasıyla zaten bir lead kayıtlı.");
    }
    setForm({ ...form, name: "", phone: "", preferredArea: "" });
    load();
  }

  async function changeStage(id: string, stage: string) {
    await fetch(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify({ stage }) });
    load();
  }

  const q = search.trim().toLowerCase();
  const filteredLeads = q
    ? leads.filter((l) =>
        [l.name, l.phone, l.preferredArea].some((f) => (f || "").toLowerCase().includes(q))
      )
    : leads;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Lead'ler</h1>

      <form onSubmit={addLead} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <input placeholder="Ad Soyad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input placeholder="Bölge" value={form.preferredArea} onChange={(e) => setForm({ ...form, preferredArea: e.target.value })} />
        <select value={form.listingType} onChange={(e) => setForm({ ...form, listingType: e.target.value })}>
          <option value="SATILIK">Satılık</option>
          <option value="KIRALIK">Kiralık</option>
        </select>
        <select value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })}>
          <option value="KONUT">Konut</option>
          <option value="TICARI">Ticari</option>
          <option value="ARSA">Arsa</option>
        </select>
        <button type="submit">Ekle</button>
      </form>

      <input
        placeholder="Ad, telefon veya bölgede ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <table width="100%" cellPadding={8}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Ad</th>
            <th>Telefon</th>
            <th>Bölge</th>
            <th>Aşama</th>
            <th>Son temas</th>
            <th>Danışman</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeads.length === 0 && (
            <tr>
              <td colSpan={6}>Eşleşen lead yok.</td>
            </tr>
          )}
          {filteredLeads.map((l) => (
            <tr key={l.id}>
              <td>{l.name}</td>
              <td>{l.phone}</td>
              <td>{l.preferredArea || "-"}</td>
              <td>
                <select value={l.stage} onChange={(e) => changeStage(l.id, e.target.value)}>
                  {Object.entries(STAGES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </td>
              <td>{l.lastContactAt ? new Date(l.lastContactAt).toLocaleDateString("tr-TR") : "-"}</td>
              <td>{l.assignedAgent?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
