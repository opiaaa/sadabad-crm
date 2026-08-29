"use client";
import { useEffect, useState } from "react";

const STAGE_LABELS: Record<string, string> = {
  YENI: "Yeni",
  GORUSULDU: "Görüşüldü",
  GOSTERIM: "Gösterim",
  TEKLIF: "Teklif",
};
const ACTIVE_STAGES = Object.keys(STAGE_LABELS);

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [staleLeads, setStaleLeads] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/tasks").then((r) => r.json()).then(setTasks);
    fetch("/api/leads/stale").then((r) => r.json()).then(setStaleLeads);
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []));
    fetch("/api/properties")
      .then((r) => r.json())
      .then((data) => setProperties(Array.isArray(data) ? data : []));
  }, []);

  const activeLeads = leads.filter(
    (l) => l.stage !== "KAPANDI_KAZANILDI" && l.stage !== "KAPANDI_KAYIP"
  );
  const activePropertiesCount = properties.filter((p) => p.status === "AKTIF").length;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Panel</h1>

      <section style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div className="card" style={{ padding: 16, minWidth: 140 }}>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Aktif Lead</div>
          <div style={{ fontSize: 28, fontFamily: "var(--font-heading)", fontWeight: 700 }}>
            {activeLeads.length}
          </div>
        </div>

        <div className="card" style={{ padding: 16, flex: 1, minWidth: 260 }}>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 6 }}>
            Aşama Dağılımı
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 14 }}>
            {ACTIVE_STAGES.map((s) => (
              <span key={s}>
                {STAGE_LABELS[s]}: <strong>{activeLeads.filter((l) => l.stage === s).length}</strong>
              </span>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 16, minWidth: 140 }}>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Aktif Portföy</div>
          <div style={{ fontSize: 28, fontFamily: "var(--font-heading)", fontWeight: 700 }}>
            {activePropertiesCount}
          </div>
        </div>
      </section>

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
        <a href="/tasks" style={{ fontSize: 14 }}>Tüm görevleri gör →</a>
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
