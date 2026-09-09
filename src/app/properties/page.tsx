"use client";
import { Fragment, useEffect, useState } from "react";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    listingNumber: "",
    address: "",
    district: "",
    roomCount: "",
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;

  function load() {
    // Arama yapılırken tüm veri (Türkçe-güvenli client-side filtreleme için) çekilir;
    // arama boşken performans için sayfalı istek atılır.
    const hasSearch = search.trim().length > 0;
    const url = hasSearch ? "/api/properties" : `/api/properties?page=${page}&pageSize=${PAGE_SIZE}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProperties(data);
          setTotalCount(data.length);
        } else {
          setProperties(Array.isArray(data.data) ? data.data : []);
          setTotalCount(data.total || 0);
        }
      });
  }

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

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
    setForm({ ...form, title: "", listingNumber: "", address: "", district: "", roomCount: "", area: "", price: "", ownerName: "", ownerPhone: "", description: "", leadId: "" });
    load();
  }

  function startEdit(p: any) {
    setEditingId(p.id);
    setEditForm({
      title: p.title,
      listingNumber: p.listingNumber || "",
      address: p.address,
      district: p.district,
      roomCount: p.roomCount || "",
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

  const q = search.trim().toLocaleLowerCase("tr");
  const filteredProperties = q
    ? properties.filter((p) =>
        [p.title, p.listingNumber, p.district, p.ownerName, p.ownerPhone].some((f) => (f || "").toLocaleLowerCase("tr").includes(q))
      )
    : properties;

  // Pasif ilanlar liste altına iner
  const sortedProperties = [...filteredProperties].sort(
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
        <input placeholder="Oda Sayısı (örn. 2+1)" value={form.roomCount} onChange={(e) => setForm({ ...form, roomCount: e.target.value })} style={{ width: 130 }} />
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

      <input
        placeholder="Başlık, ilan no, bölge, sahibi veya telefonda ara..."
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <table width="100%" cellPadding={8}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Başlık</th>
            <th>Bölge</th>
            <th>Oda Sayısı</th>
            <th>m²</th>
            <th>Fiyat</th>
            <th>Sahibi</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {sortedProperties.length === 0 && (
            <tr>
              <td colSpan={8}>Eşleşen ilan yok.</td>
            </tr>
          )}
          {sortedProperties.map((p) => {
            const isEditing = editingId === p.id;
            const isExpanded = expandedId === p.id;
            return (
              <Fragment key={p.id}>
                <tr style={{ opacity: p.status === "PASIF" ? 0.5 : 1 }}>
                  {isEditing ? (
                    <>
                      <td>
                        <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} style={{ width: "100%" }} />
                      </td>
                      <td>
                        <input value={editForm.district} onChange={(e) => setEditForm({ ...editForm, district: e.target.value })} style={{ width: "100%" }} />
                      </td>
                      <td>
                        <input value={editForm.roomCount} onChange={(e) => setEditForm({ ...editForm, roomCount: e.target.value })} style={{ width: "100%" }} />
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
                      <td colSpan={2}>
                        <button onClick={() => saveEdit(p.id)} style={{ marginRight: 6 }}>Kaydet</button>
                        <button onClick={cancelEdit}>Vazgeç</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        {p.title}
                        {p.description && (
                          <div
                            title={p.description}
                            style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.4, maxHeight: "2.8em", minWidth: 160, overflow: "hidden" }}
                          >
                            {p.description}
                          </div>
                        )}
                      </td>
                      <td>{p.district}</td>
                      <td>{p.roomCount || "-"}</td>
                      <td>{p.area}</td>
                      <td>{p.price.toLocaleString("tr-TR")} ₺</td>
                      <td>{p.ownerName}</td>
                      <td>{p.status}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button onClick={() => setExpandedId(isExpanded ? null : p.id)} style={{ marginRight: 6 }}>
                          {isExpanded ? "Gizle" : "Detay"}
                        </button>
                        <button onClick={() => startEdit(p)} style={{ marginRight: 6 }}>Düzenle</button>
                        <button onClick={() => toggleActive(p)} style={{ marginRight: 6 }}>
                          {p.status === "PASIF" ? "Aktif Et" : "Pasife Çek"}
                        </button>
                        <button onClick={() => deleteProperty(p.id)}>Sil</button>
                      </td>
                    </>
                  )}
                </tr>

                {isEditing && (
                  <tr style={{ background: "#faf8f2" }}>
                    <td colSpan={8}>
                      <div className="form-grid" style={{ marginBottom: 8 }}>
                        <input placeholder="İlan No" value={editForm.listingNumber} onChange={(e) => setEditForm({ ...editForm, listingNumber: e.target.value })} />
                        <input placeholder="Sahibi Tel" value={editForm.ownerPhone} onChange={(e) => setEditForm({ ...editForm, ownerPhone: e.target.value })} />
                        <select value={editForm.leadId} onChange={(e) => setEditForm({ ...editForm, leadId: e.target.value })}>
                          <option value="">Lead yok</option>
                          {leads.map((l) => (
                            <option key={l.id} value={l.id}>{l.name} — {l.phone}</option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        placeholder="Açıklama"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        style={{ width: "100%" }}
                      />
                    </td>
                  </tr>
                )}

                {!isEditing && isExpanded && (
                  <tr>
                    <td colSpan={8} style={{ background: "#faf8f2" }}>
                      <div className="form-grid">
                        <div><strong>İlan No:</strong> {p.listingNumber || "-"}</div>
                        <div><strong>Sahibi Tel:</strong> {p.ownerPhone}</div>
                        <div><strong>Lead:</strong> {p.lead ? p.lead.name : "-"}</div>
                        <div><strong>Eklenme Tarihi:</strong> {new Date(p.createdAt).toLocaleDateString("tr-TR")}</div>
                        <div><strong>İlan sahibi (danışman):</strong> {p.listingAgent?.name}</div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>

      {!search.trim() && totalCount > PAGE_SIZE && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 16 }}>
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Önceki</button>
          <span style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
            Sayfa {page} / {Math.ceil(totalCount / PAGE_SIZE)} ({totalCount} kayıt)
          </span>
          <button disabled={page >= Math.ceil(totalCount / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Sonraki →</button>
        </div>
      )}
    </div>
  );
}
