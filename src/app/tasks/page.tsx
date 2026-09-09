"use client";
import { useEffect, useState } from "react";
import { showToast } from "../components/toast";
import LeadPicker from "../components/LeadPicker";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", leadId: "" });
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    load();
    fetch("/api/leads").then((r) => r.json()).then(setLeads);
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: form.title,
        description: form.description || undefined,
        dueDate: new Date(form.dueDate).toISOString(),
        leadId: form.leadId || undefined,
      }),
    });
    if (!res.ok) {
      showToast("Görev eklenirken hata oluştu.", "error");
      return;
    }
    showToast("Görev eklendi.");
    setForm({ title: "", description: "", dueDate: "", leadId: "" });
    load();
  }

  async function completeTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status: "TAMAMLANDI" }) });
    if (!res.ok) {
      showToast("Görev güncellenemedi.", "error");
      return;
    }
    showToast("Görev tamamlandı olarak işaretlendi.");
    load();
  }

  async function cancelTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status: "IPTAL" }) });
    if (!res.ok) {
      showToast("Görev güncellenemedi.", "error");
      return;
    }
    showToast("Görev iptal edildi.");
    load();
  }

  async function deleteTask(id: string) {
    if (!confirm("Bu görevi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("Görev silinemedi.", "error");
      return;
    }
    showToast("Görev silindi.");
    load();
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Görevler</h1>

      <form onSubmit={addTask} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <input placeholder="Başlık" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
        <div style={{ width: 220 }}>
          <LeadPicker leads={leads} value={form.leadId} onChange={(leadId) => setForm({ ...form, leadId })} />
        </div>
        <textarea
          placeholder="Açıklama (opsiyonel)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={{ width: "100%", minHeight: 50 }}
        />
        <button type="submit">Ekle</button>
      </form>

      <table width="100%" cellPadding={8}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Son tarih</th>
            <th>Başlık</th>
            <th>Lead</th>
            <th>Atanan</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={5} className="loading-text">Yükleniyor...</td>
            </tr>
          )}
          {!loading && tasks.length === 0 && (
            <tr>
              <td colSpan={5}>Bekleyen görev yok.</td>
            </tr>
          )}
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.dueDate).toLocaleDateString("tr-TR")}</td>
              <td>
                {t.title}
                {t.description && (
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{t.description}</div>
                )}
              </td>
              <td>{t.lead ? `${t.lead.name} — ${t.lead.phone}` : "-"}</td>
              <td>{t.assignedTo?.name || "-"}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                <button onClick={() => completeTask(t.id)} style={{ marginRight: 6 }}>Tamamlandı</button>
                <button onClick={() => cancelTask(t.id)} style={{ marginRight: 6 }}>İptal Et</button>
                <button onClick={() => deleteTask(t.id)}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
