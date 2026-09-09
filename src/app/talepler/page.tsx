"use client";
import { Fragment, useEffect, useState } from "react";
import { showToast } from "../components/toast";
import LeadPicker from "../components/LeadPicker";

const MULK_TIPI_LABELS: Record<string, string> = {
  DAIRE: "Daire",
  ISYERI: "İşyeri",
  OFIS: "Ofis",
  IS_HANI: "İş Hanı",
  DEPO: "Depo",
};

const INTERACTION_TYPE_LABELS: Record<string, string> = {
  arama: "Arama",
  mesaj: "Mesaj",
  gosterim: "Gösterim",
  not: "Not",
};

const SONUC_LABELS: Record<string, string> = {
  BEKLIYOR: "Bekliyor",
  KARSILANDI: "Karşılandı",
  VAZGECTI: "Vazgeçti",
};

const ROL_LABELS: Record<string, string> = {
  ALICI: "Alıcı",
  SATICI: "Satıcı",
};

function formatBudget(min?: number | null, max?: number | null) {
  if (!min && !max) return "-";
  if (min && max) return `${min.toLocaleString("tr-TR")} - ${max.toLocaleString("tr-TR")} ₺`;
  return `${(min || max)!.toLocaleString("tr-TR")} ₺`;
}

export default function TaleplerPage() {
  const [talepler, setTalepler] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    adSoyad: "",
    phone: "",
    listingType: "SATILIK",
    il: "",
    ilce: "",
    mahalle: "",
    mulkTipi: "DAIRE",
    rol: "ALICI",
    budgetMin: "",
    budgetMax: "",
    description: "",
    leadId: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [historyOpenId, setHistoryOpenId] = useState<string | null>(null);
  const [interactionsByTalep, setInteractionsByTalep] = useState<Record<string, any[]>>({});
  const [historyLoading, setHistoryLoading] = useState<Record<string, boolean>>({});
  const [newInteraction, setNewInteraction] = useState({ type: "arama", content: "" });

  function load() {
    fetch("/api/talepler")
      .then((r) => r.json())
      .then((data) => setTalepler(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
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
      adSoyad: selectedLead ? selectedLead.name : form.adSoyad,
      phone: selectedLead ? selectedLead.phone : form.phone,
    });
  }

  async function addTalep(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/talepler", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        mahalle: form.mahalle || undefined,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
        leadId: form.leadId || undefined,
      }),
    });
    if (!res.ok) {
      showToast("Talep eklenirken hata oluştu.", "error");
      return;
    }
    showToast("Talep eklendi.");
    setForm({ ...form, adSoyad: "", phone: "", il: "", ilce: "", mahalle: "", budgetMin: "", budgetMax: "", description: "", leadId: "" });
    load();
  }

  async function changeSonuc(id: string, sonuc: string) {
    const res = await fetch(`/api/talepler/${id}`, { method: "PATCH", body: JSON.stringify({ sonuc }) });
    if (!res.ok) {
      showToast("Sonuç güncellenemedi.", "error");
      return;
    }
    showToast("Sonuç güncellendi.");
    load();
  }

  async function markContactedToday(id: string) {
    const res = await fetch(`/api/talepler/${id}`, { method: "PATCH", body: JSON.stringify({ markContacted: true }) });
    if (!res.ok) {
      showToast("Temas tarihi güncellenemedi.", "error");
      return;
    }
    showToast("Bugün temas kuruldu olarak işaretlendi.");
    load();
  }

  function toggleHistory(talepId: string) {
    if (historyOpenId === talepId) {
      setHistoryOpenId(null);
      return;
    }
    setHistoryOpenId(talepId);
    setNewInteraction({ type: "arama", content: "" });
    if (!interactionsByTalep[talepId]) {
      setHistoryLoading((h) => ({ ...h, [talepId]: true }));
      fetch(`/api/interactions?talepId=${talepId}`)
        .then((r) => r.json())
        .then((data) => setInteractionsByTalep((m) => ({ ...m, [talepId]: Array.isArray(data) ? data : [] })))
        .finally(() => setHistoryLoading((h) => ({ ...h, [talepId]: false })));
    }
  }

  async function addInteraction(talepId: string, e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/interactions", {
      method: "POST",
      body: JSON.stringify({ talepId, type: newInteraction.type, content: newInteraction.content }),
    });
    if (!res.ok) {
      showToast("Kayıt eklenemedi.", "error");
      return;
    }
    const created = await res.json();
    showToast("Temas kaydedildi.");
    setInteractionsByTalep((m) => ({ ...m, [talepId]: [created, ...(m[talepId] || [])] }));
    setNewInteraction({ type: "arama", content: "" });
    load();
  }

  function startEdit(t: any) {
    setEditingId(t.id);
    setEditForm({
      adSoyad: t.adSoyad,
      phone: t.phone,
      listingType: t.listingType,
      rol: t.rol,
      il: t.il,
      ilce: t.ilce,
      mahalle: t.mahalle || "",
      mulkTipi: t.mulkTipi,
      budgetMin: t.budgetMin != null ? String(t.budgetMin) : "",
      budgetMax: t.budgetMax != null ? String(t.budgetMax) : "",
      description: t.description || "",
      leadId: t.leadId || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/talepler/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...editForm,
        mahalle: editForm.mahalle || undefined,
        budgetMin: editForm.budgetMin ? Number(editForm.budgetMin) : null,
        budgetMax: editForm.budgetMax ? Number(editForm.budgetMax) : null,
        leadId: editForm.leadId || null,
      }),
    });
    if (!res.ok) {
      showToast("Değişiklikler kaydedilemedi.", "error");
      return;
    }
    showToast("Değişiklikler kaydedildi.");
    setEditingId(null);
    setEditForm({});
    load();
  }

  async function deleteTalep(id: string) {
    if (!confirm("Bu talebi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    const res = await fetch(`/api/talepler/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("Talep silinemedi.", "error");
      return;
    }
    showToast("Talep silindi.");
    load();
  }

  const q = search.trim().toLocaleLowerCase("tr");
  const filteredTalepler = q
    ? talepler.filter((t) =>
        [t.adSoyad, t.phone, t.il, t.ilce, t.mahalle].some((f) => (f || "").toLocaleLowerCase("tr").includes(q))
      )
    : talepler;

  // Vazgeçilen talepler pasif sayılır — liste altına iner, soluk görünür
  const sortedTalepler = [...filteredTalepler].sort(
    (a, b) => (a.sonuc === "VAZGECTI" ? 1 : 0) - (b.sonuc === "VAZGECTI" ? 1 : 0)
  );

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 16 }}>
      <h1>Talepler</h1>

      <form onSubmit={addTalep} className="card" style={{ marginBottom: 24 }}>
        <div className="form-section">
          <label className="form-section-label">Lead Bağlantısı</label>
          <LeadPicker leads={leads} value={form.leadId} onChange={selectLeadForForm} />
        </div>

        <div className="form-section">
          <label className="form-section-label">Kişi Bilgileri</label>
          <div className="form-grid">
            <input placeholder="Ad Soyad" value={form.adSoyad} onChange={(e) => setForm({ ...form, adSoyad: e.target.value })} required />
            <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
        </div>

        <div className="form-section">
          <label className="form-section-label">Talep Detayı</label>
          <div className="form-grid">
            <select value={form.listingType} onChange={(e) => setForm({ ...form, listingType: e.target.value })}>
              <option value="SATILIK">Satılık</option>
              <option value="KIRALIK">Kiralık</option>
            </select>
            <select value={form.mulkTipi} onChange={(e) => setForm({ ...form, mulkTipi: e.target.value })}>
              {Object.entries(MULK_TIPI_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
              {Object.entries(ROL_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <label className="form-section-label">Konum</label>
          <div className="form-grid">
            <input placeholder="İl" value={form.il} onChange={(e) => setForm({ ...form, il: e.target.value })} required />
            <input placeholder="İlçe" value={form.ilce} onChange={(e) => setForm({ ...form, ilce: e.target.value })} required />
            <input placeholder="Mahalle (opsiyonel)" value={form.mahalle} onChange={(e) => setForm({ ...form, mahalle: e.target.value })} />
          </div>
        </div>

        <div className="form-section">
          <label className="form-section-label">Bütçe</label>
          <div className="form-grid">
            <input placeholder="Bütçe min" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} />
            <input placeholder="Bütçe max" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} />
          </div>
        </div>

        <div className="form-section">
          <label className="form-section-label">Açıklama</label>
          <textarea
            placeholder="Açıklama (opsiyonel)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ width: "100%", minHeight: 60 }}
          />
        </div>

        <button type="submit">Ekle</button>
      </form>

      <input
        placeholder="Ad, telefon, il, ilçe veya mahallede ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <table width="100%" cellPadding={8}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Ad Soyad</th>
            <th>Telefon</th>
            <th>Lead</th>
            <th>Emlak Tipi</th>
            <th>Konum</th>
            <th>Gayrimenkul Tipi</th>
            <th>Rol</th>
            <th>Bütçe</th>
            <th>Son Temas</th>
            <th>Sonuç</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={11} className="loading-text">Yükleniyor...</td>
            </tr>
          )}
          {!loading && sortedTalepler.length === 0 && (
            <tr>
              <td colSpan={11}>Eşleşen talep yok.</td>
            </tr>
          )}
          {sortedTalepler.map((t) => {
            const isEditing = editingId === t.id;
            const historyOpen = historyOpenId === t.id;
            return (
              <Fragment key={t.id}>
              <tr style={{ opacity: t.sonuc === "VAZGECTI" ? 0.5 : 1 }}>
                {isEditing ? (
                  <>
                    <td>
                      <input value={editForm.adSoyad} onChange={(e) => setEditForm({ ...editForm, adSoyad: e.target.value })} style={{ width: "100%" }} />
                    </td>
                    <td>
                      <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} style={{ width: "100%" }} />
                    </td>
                    <td>
                      <LeadPicker
                        leads={leads}
                        value={editForm.leadId}
                        onChange={(leadId) => setEditForm({ ...editForm, leadId })}
                        placeholder="Lead yok"
                      />
                    </td>
                    <td>
                      <select value={editForm.listingType} onChange={(e) => setEditForm({ ...editForm, listingType: e.target.value })}>
                        <option value="SATILIK">Satılık</option>
                        <option value="KIRALIK">Kiralık</option>
                      </select>
                    </td>
                    <td>
                      <input placeholder="İl" value={editForm.il} onChange={(e) => setEditForm({ ...editForm, il: e.target.value })} style={{ width: "100%", marginBottom: 4 }} />
                      <input placeholder="İlçe" value={editForm.ilce} onChange={(e) => setEditForm({ ...editForm, ilce: e.target.value })} style={{ width: "100%", marginBottom: 4 }} />
                      <input placeholder="Mahalle" value={editForm.mahalle} onChange={(e) => setEditForm({ ...editForm, mahalle: e.target.value })} style={{ width: "100%" }} />
                    </td>
                    <td>
                      <select value={editForm.mulkTipi} onChange={(e) => setEditForm({ ...editForm, mulkTipi: e.target.value })}>
                        {Object.entries(MULK_TIPI_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={editForm.rol} onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}>
                        {Object.entries(ROL_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input placeholder="min" value={editForm.budgetMin} onChange={(e) => setEditForm({ ...editForm, budgetMin: e.target.value })} style={{ width: 70, marginBottom: 4 }} />
                      <input placeholder="max" value={editForm.budgetMax} onChange={(e) => setEditForm({ ...editForm, budgetMax: e.target.value })} style={{ width: 70 }} />
                    </td>
                    <td colSpan={2}>
                      <textarea
                        placeholder="Açıklama"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button onClick={() => saveEdit(t.id)} style={{ marginRight: 6 }}>Kaydet</button>
                      <button onClick={cancelEdit}>Vazgeç</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      {t.adSoyad}
                      {t.description && (
                        <div
                          title={t.description}
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-muted)",
                            lineHeight: 1.4,
                            maxHeight: "2.8em",
                            minWidth: 180,
                            overflow: "hidden",
                          }}
                        >
                          {t.description}
                        </div>
                      )}
                    </td>
                    <td>{t.phone}</td>
                    <td>{t.lead ? t.lead.name : "-"}</td>
                    <td>{t.listingType === "SATILIK" ? "Satılık" : "Kiralık"}</td>
                    <td>{[t.il, t.ilce, t.mahalle].filter(Boolean).join(" / ")}</td>
                    <td>{MULK_TIPI_LABELS[t.mulkTipi]}</td>
                    <td>{ROL_LABELS[t.rol]}</td>
                    <td>{formatBudget(t.budgetMin, t.budgetMax)}</td>
                    <td>
                      {t.lastContactAt ? new Date(t.lastContactAt).toLocaleDateString("tr-TR") : "-"}
                      <div>
                        <button onClick={() => markContactedToday(t.id)} style={{ fontSize: 11, padding: "3px 8px", marginTop: 4 }}>
                          Bugün temas kuruldu
                        </button>
                      </div>
                    </td>
                    <td>
                      <select value={t.sonuc} onChange={(e) => changeSonuc(t.id, e.target.value)}>
                        {Object.entries(SONUC_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button onClick={() => startEdit(t)} style={{ marginRight: 6 }}>Düzenle</button>
                      <button onClick={() => toggleHistory(t.id)} style={{ marginRight: 6 }}>
                        {historyOpen ? "Geçmişi Gizle" : "Geçmiş"}
                      </button>
                      <button onClick={() => deleteTalep(t.id)}>Sil</button>
                    </td>
                  </>
                )}
              </tr>
              {historyOpen && !isEditing && (
                <tr>
                  <td colSpan={11} style={{ background: "#faf8f2", padding: 14 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div className="form-section-label">Temas Geçmişi</div>

                      {historyLoading[t.id] && <div className="loading-text">Yükleniyor...</div>}
                      {!historyLoading[t.id] && (interactionsByTalep[t.id] || []).length === 0 && (
                        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Henüz kayıt yok.</div>
                      )}
                      {!historyLoading[t.id] &&
                        (interactionsByTalep[t.id] || []).map((i) => (
                          <div key={i.id} style={{ fontSize: 13, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>
                            <div>
                              <strong>{INTERACTION_TYPE_LABELS[i.type] || i.type}</strong>
                              <span style={{ color: "var(--color-text-muted)", marginLeft: 8 }}>
                                {new Date(i.createdAt).toLocaleString("tr-TR")} — {i.user?.name}
                              </span>
                            </div>
                            <div>{i.content}</div>
                          </div>
                        ))}

                      <form
                        onSubmit={(e) => addInteraction(t.id, e)}
                        style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 4, flexWrap: "wrap" }}
                      >
                        <select
                          value={newInteraction.type}
                          onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value })}
                        >
                          {Object.entries(INTERACTION_TYPE_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                        <input
                          placeholder="Ne konuşuldu / not..."
                          value={newInteraction.content}
                          onChange={(e) => setNewInteraction({ ...newInteraction, content: e.target.value })}
                          style={{ flex: 1, minWidth: 200 }}
                          required
                        />
                        <button type="submit">Ekle</button>
                      </form>
                    </div>
                  </td>
                </tr>
              )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
