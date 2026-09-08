"use client";
import { useEffect, useState } from "react";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    listingNumber: "",
    address: "",
    district: "",
    area: "",
    price: "",
    listingType: "SATILIK",
    propertyType: "KONUT",
    ownerName: "",
    ownerPhone: "",
    description: "",
    leadId: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  function load() {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((data) => setProperties(Array.isArray(data) ? data : []));
  }
  useEffect(() => {
    load();
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []));
  }, []);

  function selectLeadForForm(leadId: string) {
    const selectedLead = leads.find((l) => l.id === leadId);
    setForm({
      ...form,
      leadId,
      ownerName: selectedLead ? selectedLead.name : form.ownerName,
      ownerPhone: selectedLead ? selectedLead.phone : form.ownerPhone,
    });
  }

  async function addProperty(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/properties", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        area: Number(form.area),
        price: Number(form.price),
        leadId: form.leadId || undefined,
      }),
    });
    setForm({ ...form, title: "", listingNumber: "", address: "", district: "", area: "", price: "", ownerName: "", ownerPhone: "", description: "", leadId: "" });
    load();
  }

  function startEdit(p: any) {
    setEditingId(p.id);
    setEditForm({
      title: p.title,
      listingNumber: p.listingNumber || "",
      address: p.address,
      district: p.district,
      area: String(p.area),
      price: String(p.price),
      ownerName: p.ownerName,
      ownerPhone: p.ownerPhone,
      description: p.description || "",
      leadId: p.leadId || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id: string) {
    await fetch(`/api/properties/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...editForm,
        area: Number(editForm.area),
        price: Number(editForm.price),
        leadId: editForm.leadId || null,
      }),
    });
    setEditingId(null);
    setEditForm({});
    load();
  }

  async function toggleActive(p: any) {
    const nextStatus = p.status === "PASIF" ? "AKTIF" : "PASIF";
    await fetch(`/api/properties/${p.id}`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
    load();
  }

  async function deleteProperty(id: string) {
    if (!confirm("Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    await fetch(`/api/properties/${id}`, { method: "DELETE" });
    load();
  }

  // Pasif ilanlar liste altına iner
  const sortedProperties = [...properties].sort(
    (a, b) => (a.status === "PASIF" ? 1 : 0) - (b.status === "PASIF" ? 1 : 0)
  );

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: 16 }}>
      <h1>Portföy</h1>

      <form onSubmit={addProperty} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <select value={form.leadId} onChange={(e) => selectLeadForForm(e.target.value)}>
          <option value="">Lead seç (opsiyonel)</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>{l.name} — {l.phone}</option>
          ))}
        </select>
        <input placeholder="Başlık" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input placeholder="İlan No" value={form.listingNumber} onChange={(e) => setForm({ ...form, listingNumber: e.target.value })} style={{ width: 110 }} />
        <input placeholder="Adres" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        <input placeholder="Bölge/Mahalle" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required />
        <input placeholder="m²" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required />
        <input placeholder="Fiyat" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input placeholder="Sahibi" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} required />
        <input placeholder="Sahibi Tel" value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} required />
        <textarea
          placeholder="Açıklama"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={{ width: "100%", minHeight: 50 }}
        />
        <button type="submit">Ekle</button>
      </form>

      <table width="100%" cellPadding={8}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Başlık</th>
            <th>İlan No</th>
            <th>Bölge</th>
            <th>m²</th>
            <th>Fiyat</th>
            <th>Sahibi</th>
            <th>Sahibi Tel</th>
            <th>Lead</th>
            <th>Durum</th>
            <th>Eklenme Tarihi</th>
            <th>İlan sahibi (danışman)</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {sortedProperties.map((p) => {
            const isEditing = editingId === p.id;
            return (
              <tr key={p.id} style={{ opacity: p.status === "PASIF" ? 0.5 : 1 }}>
                {isEditing ? (
                  <>
                    <td>
                      <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} style={{ width: "100%" }} />
                    </td>
                    <td>
                      <input value={editForm.listingNumber} onChange={(e) => setEditForm({ ...editForm, listingNumber: e.target.value })} style={{ width: "100%" }} />
                    </td>
                    <td>
                      <input value={editForm.district} onChange={(e) => setEditForm({ ...editForm, district: e.target.value })} style={{ width: "100%" }} />
                    </td>
                    <td>
                      <input value={editForm.area} onChange={(e) => setEditForm({ ...editForm, area: e.target.value })} style={{ width: 60 }} />
                    </td>
                    <td>
                      <input value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} style={{ width: 80 }} />
                    </td>
                    <td>
                      <input value={editForm.ownerName} onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })} style={{ width: "100%" }} />
                    </td>
                    <td>
                      <input value={editForm.ownerPhone} onChange={(e) => setEditForm({ ...editForm, ownerPhone: e.target.value })} style={{ width: "100%" }} />
                    </td>
                    <td>
                      <select value={editForm.leadId} onChange={(e) => setEditForm({ ...editForm, leadId: e.target.value })}>
                        <option value="">Lead yok</option>
                        {leads.map((l) => (
                          <option key={l.id} value={l.id}>{l.name} — {l.phone}</option>
                        ))}
                      </select>
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
                      <button onClick={() => saveEdit(p.id)} style={{ marginRight: 6 }}>Kaydet</button>
                      <button onClick={cancelEdit}>Vazgeç</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      {p.title}
                      {p.description && (
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{p.description}</div>
                      )}
                    </td>
                    <td>{p.listingNumber || "-"}</td>
                    <td>{p.district}</td>
                    <td>{p.area}</td>
                    <td>{p.price.toLocaleString("tr-TR")} ₺</td>
                    <td>{p.ownerName}</td>
                    <td>{p.ownerPhone}</td>
                    <td>{p.lead ? p.lead.name : "-"}</td>
                    <td>{p.status}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td>{p.listingAgent?.name}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button onClick={() => startEdit(p)} style={{ marginRight: 6 }}>Düzenle</button>
                      <button onClick={() => toggleActive(p)} style={{ marginRight: 6 }}>
                        {p.status === "PASIF" ? "Aktif Et" : "Pasife Çek"}
                      </button>
                      <button onClick={() => deleteProperty(p.id)}>Sil</button>
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
