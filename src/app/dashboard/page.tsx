"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [staleLeads, setStaleLeads] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/tasks").then((r) => r.json()).then(setTasks);
    fetch("/api/leads/stale").then((r) => r.json()).then(setStaleLeads);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Panel</h1>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>Bugün ve yaklaşan görevler</h2>
        {tasks.length === 0 && <p>Bekleyen görev yok.</p>}
        <ul>
          {tasks.map((t) => (
            <li key={t.id}>
              <strong>{new Date(t.dueDate).toLocaleDateString("tr-TR")}</strong> — {t.title}
              {t.lead && ` (${t.lead.name} — ${t.lead.phone})`}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18, color: "#b91c1c" }}>Soğuyan lead'ler (3+ gün temas yok)</h2>
        {staleLeads.length === 0 && <p>Soğuyan lead yok — takip düzenli.</p>}
        <ul>
          {staleLeads.map((l) => (
            <li key={l.id}>
              {l.name} — {l.phone} — son temas:{" "}
              {l.lastContactAt ? new Date(l.lastContactAt).toLocaleDateString("tr-TR") : "hiç"} —{" "}
              {l.assignedAgent?.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
