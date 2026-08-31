"use client";
import { useEffect, useState } from "react";

const MULK_TIPI_LABELS: Record<string, string> = {
  DAIRE: "Daire",
  ISYERI: "İşyeri",
  OFIS: "Ofis",
  IS_HANI: "İş Hanı",
  DEPO: "Depo",
};

const SONUC_LABELS: Record<string, string> = {
  BEKLIYOR: "Bekliyor",
  KARSILANDI: "Karşılandı",
  VAZGECTI: "Vazgeçti",
};

function formatBudget(min?: number | null, max?: number | null) {
  if (!min && !max) return "-";
  if (min && max) return `${min.toLocaleString("tr-TR")} - ${max.toLocaleString("tr-TR")} ₺`;
  return `${(min || max)!.toLocaleString("tr-TR")} ₺`;
}

export default function TaleplerPage() {
  const [talepler, setTalepler] = useState<any[]>([]);
  const [form, setForm] = useState({
    adSoyad: "",
    phone: "",
    listingType: "SATILIK",
    il: "",
    ilce: "",
    mahalle: "",
    mulkTipi: "DAIRE",
    budgetMin: "",
    budgetMax: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  function load() {
    fetch("/api/talepler")
      .then((r) => r.json())
      .then((data) => setTalepler(Array.isArray(data) ? data : []));
  }
  useEffect(load, []);

  async function addTalep(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/talepler", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        mahalle: form.mahalle || undefined,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      }),
    });
    setForm({ ...form, adSoyad: "", phone: "", il: "", ilce: "", mahalle: "", budgetMin: "", budgetMax: "", description: "" });
    load();
  }

  async function changeSonuc(id: string, sonuc: string) {
    await fetch(`/api/talepler/${id}`, { method: "PATCH", body: JSON.stringify({ sonuc }) });
    load();
  }

  async function markContactedToday(id: string) {
    await fetch(`/api/talepler/${id}`, { method: "PATCH", body: JSON.stringify({ markContacted: true }) });
    load();
  }

  function startEdit(t: any) {
    setEditingId(t.id);
    setEditForm({
      adSoyad: t.adSoyad,
      phone: t.phone,
      listingType: t.listingType,
      il: t.il,
      ilce: t.ilce,
      mahalle: t.mahalle || "",
      mulkTipi: t.mulkTipi,
      budgetMin: t.budgetMin != null ? String(t.budgetMin) : "",
      budgetMax: t.budgetMax != null ? String(t.budgetMax) : "",
      description: t.description || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id: string) {
    await fetch(`/api/talepler/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...editForm,
        mahalle: editForm.mahalle || undefined,
        budgetMin: editForm.budgetMin ? Number(editForm.budgetMin) : null,
        budgetMax: editForm.budgetMax ? Number(editForm.budgetMax) : null,
      }),
    });
    setEditingId(null);
    setEditForm({});
    load();
  }

  async function deleteTalep(id: string) {
    if (!confirm("Bu talebi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    await fetch(`/api/talepler/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 16 }}>
      <h1>Talepler</h1>

      <form onSubmit={addTalep} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <input placeholder="Ad Soyad" value={form.adSoyad} onChange={(e) => setForm({ ...form, adSoyad: e.target.value })} required />
        <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <select value={form.listingType} onChange={(e) => setForm({ ...form, listingType: e.target.value })}>
          <option value="SATILIK">Satılık</option>
          <option value="KIRALIK">Kiralık</option>
        </select>
        <input placeholder="İl" value={form.il} onChange={(e) => setForm({ ...form, il: e.target.value })} style={{ width: 100 }} required />
        <input placeholder="İlçe" value={form.ilce} onChange={(e) => setForm({ ...form, ilce: e.target.value })} style={{ width: 100 }} required />
        <input placeholder="Mahalle (opsiyonel)" value={form.mahalle} onChange={(e) => setForm({ ...form, mahalle: e.target.value })} />
        <select value={form.mulkTipi} onChange={(e) => setForm({ ...form, mulkTipi: e.target.value })}>
          {Object.entries(MULK_TIPI_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input placeholder="Bütçe min" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} style={{ width: 100 }} />
        <input placeholder="Bütçe max" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} style={{ width: 100 }} />
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
            <th>Ad Soyad</th>
            <th>Telefon</th>
            <th>Emlak Tipi</th>
            <th>Konum</th>
            <th>Gayrimenkul Tipi</th>
            <th>Bütçe</th>
            <th>Son Temas</th>
            <th>Sonuç</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {talepler.length === 0 && (
            <tr>
              <td colSpan={9}>Kayıtlı talep yok.</td>
            </tr>
          )}
          {talepler.map((t) => {
            const isEditing = editingId === t.id;
            return (
              <tr key={t.id}>
                {isEditing ? (
                  <>
                    <td>
                      <input value={editForm.adSoyad} onChange={(e) => setEditForm({ ...editForm, adSoyad: e.target.value })} style={{ width: "100%" }} />
                    </td>
                    <td>
                      <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} style={{ width: "100%" }} />
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
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{t.description}</div>
                      )}
                    </td>
                    <td>{t.phone}</td>
                    <td>{t.listingType === "SATILIK" ? "Satılık" : "Kiralık"}</td>
                    <td>{[t.il, t.ilce, t.mahalle].filter(Boolean).join(" / ")}</td>
                    <td>{MULK_TIPI_LABELS[t.mulkTipi]}</td>
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
                      <button onClick={() => deleteTalep(t.id)}>Sil</button>
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
