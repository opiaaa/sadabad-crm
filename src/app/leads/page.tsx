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
    listingNumber: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

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
    setForm({ ...form, name: "", phone: "", preferredArea: "", listingNumber: "", description: "" });
    load();
  }

  async function changeStage(id: string, stage: string) {
    await fetch(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify({ stage }) });
    load();
  }

  function startEdit(l: any) {
    setEditingId(l.id);
    setEditForm({
      name: l.name,
      phone: l.phone,
      preferredArea: l.preferredArea || "",
      listingNumber: l.listingNumber || "",
      description: l.description || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id: string) {
    await fetch(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify(editForm) });
    setEditingId(null);
    setEditForm({});
    load();
  }

  async function toggleActive(l: any) {
    await fetch(`/api/leads/${l.id}`, { method: "PATCH", body: JSON.stringify({ isActive: !l.isActive }) });
    load();
  }

  async function deleteLead(id: string) {
    if (!confirm("Bu lead'i silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    load();
  }

  const q = search.trim().toLowerCase();
  const filteredLeads = q
    ? leads.filter((l) =>
        [l.name, l.phone, l.preferredArea, l.listingNumber].some((f) => (f || "").toLowerCase().includes(q))
      )
    : leads;

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 16 }}>
      <h1>Lead'ler</h1>

      <form onSubmit={addLead} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input placeholder="Ad Soyad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input placeholder="İlan No" value={form.listingNumber} onChange={(e) => setForm({ ...form, listingNumber: e.target.value })} style={{ width: 110 }} />
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
        <textarea
          placeholder="Açıklama"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={{ width: "100%", minHeight: 50 }}
        />
        <button type="submit">Ekle</button>
      </form>

      <input
        placeholder="Ad, telefon, ilan no veya bölgede ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <table width="100%" cellPadding={8}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Ad</th>
            <th>Telefon</th>
            <th>İlan No</th>
            <th>Bölge</th>
            <th>Aşama</th>
            <th>Son temas</th>
            <th>Danışman</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeads.length === 0 && (
            <tr>
              <td colSpan={8}>Eşleşen lead yok.</td>
            </tr>
          )}
          {filteredLeads.map((l) => {
            const isEditing = editingId === l.id;
            return (
              <tr key={l.id} style={{ opacity: l.isActive ? 1 : 0.5 }}>
                {isEditing ? (
                  <>
                    <td>
                      <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ width: "100%" }} />
                    </td>
                    <td>
                      <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} style={{ width: "100%" }} />
                    </td>
                    <td>
                      <input value={editForm.listingNumber} onChange={(e) => setEditForm({ ...editForm, listingNumber: e.target.value })} style={{ width: "100%" }} />
                    </td>
                    <td>
                      <input value={editForm.preferredArea} onChange={(e) => setEditForm({ ...editForm, preferredArea: e.target.value })} style={{ width: "100%" }} />
                    </td>
                    <td colSpan={3}>
                      <textarea
                        placeholder="Açıklama"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button onClick={() => saveEdit(l.id)} style={{ marginRight: 6 }}>Kaydet</button>
                      <button onClick={cancelEdit}>Vazgeç</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      {l.name}
                      {!l.isActive && <span style={{ fontSize: 11, marginLeft: 6, color: "var(--color-text-muted)" }}>(pasif)</span>}
                      {l.description && (
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{l.description}</div>
                      )}
                    </td>
                    <td>{l.phone}</td>
                    <td>{l.listingNumber || "-"}</td>
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
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button onClick={() => startEdit(l)} style={{ marginRight: 6 }}>Düzenle</button>
                      <button onClick={() => toggleActive(l)} style={{ marginRight: 6 }}>
                        {l.isActive ? "Pasife Çek" : "Aktif Et"}
                      </button>
                      <button onClick={() => deleteLead(l.id)}>Sil</button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
