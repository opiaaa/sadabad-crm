"use client";
import { useEffect, useState } from "react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", dueDate: "", leadId: "" });

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
        dueDate: new Date(form.dueDate).toISOString(),
        leadId: form.leadId || undefined,
      }),
    });
    setForm({ title: "", dueDate: "", leadId: "" });
    load();
  }

  async function completeTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "PATCH" });
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
        <button type="submit">Ekle</button>
      </form>

      <table width="100%" cellPadding={8} style={{ background: "#fff" }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Son tarih</th>
            <th>Başlık</th>
            <th>Lead</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 && (
            <tr>
              <td colSpan={4}>Bekleyen görev yok.</td>
            </tr>
          )}
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.dueDate).toLocaleDateString("tr-TR")}</td>
              <td>{t.title}</td>
              <td>{t.lead ? `${t.lead.name} — ${t.lead.phone}` : "-"}</td>
              <td>
                <button onClick={() => completeTask(t.id)}>Tamamlandı</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
