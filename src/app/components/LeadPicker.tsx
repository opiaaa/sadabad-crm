"use client";
import { useState } from "react";

export default function LeadPicker({
  leads,
  value,
  onChange,
  placeholder = "Lead seç (opsiyonel)",
}: {
  leads: any[];
  value: string;
  onChange: (leadId: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = leads.find((l) => l.id === value);

  const q = query.trim().toLocaleLowerCase("tr");
  const filtered = (
    q ? leads.filter((l) => `${l.name} ${l.phone}`.toLocaleLowerCase("tr").includes(q)) : leads
  ).slice(0, 8);

  if (selected) {
    return (
      <div className="lead-picker-selected">
        <span>{selected.name} — {selected.phone}</span>
        <button type="button" onClick={() => onChange("")}>×</button>
      </div>
    );
  }

  return (
    <div className="lead-picker">
      <input
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={{ width: "100%" }}
      />
      {open && filtered.length > 0 && (
        <div className="lead-picker-dropdown">
          {filtered.map((l) => (
            <div
              key={l.id}
              className="lead-picker-option"
              onMouseDown={() => {
                onChange(l.id);
                setQuery("");
                setOpen(false);
              }}
            >
              {l.name} — {l.phone}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
