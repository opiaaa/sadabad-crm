"use client";
import { useEffect, useState } from "react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", leadId: "" });

  function load() {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => setTasks(Array.isArray(data) ? data : []));
  }
  useEffect(() => {
    load();
    fetch("/api/leads").then((r) => r.json()).then(setLeads);
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: form.title,
        description: form.description || undefined,
        dueDate: new Date(form.dueDate).toISOString(),
        leadId: form.leadId || undefined,
      }),
    });
    setForm({ title: "", description: "", dueDate: "", leadId: "" });
    load();
  }

  async function completeTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status: "TAMAMLANDI" }) });
    load();
  }

  async function cancelTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status: "IPTAL" }) });
    load();
  }

  async function deleteTask(id: string) {
    if (!confirm("Bu görevi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Görevler</h1>

      <form onSubmit={addTask} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <input placeholder="Başlık" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
        <select value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })}>
          <option value="">Lead seç (opsiyonel)</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>{l.name} — {l.phone}</option>
          ))}
        </select>
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
          {tasks.length === 0 && (
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
