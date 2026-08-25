"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Email veya şifre hatalı");
    else router.push("/dashboard");
  }

  return (
    <div style={{ maxWidth: 380, margin: "80px auto", padding: 16 }}>
      <div className="card">
        <h1 style={{ fontSize: 22, textAlign: "center", marginBottom: 4 }}>SADABAD EMLAK</h1>
        <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: 13, marginTop: 0, marginBottom: 24 }}>
          Kurumsal CRM Girişi
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", margin: "8px 0" }}
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", margin: "8px 0" }}
          />
          {error && <p style={{ color: "#b91c1c", fontSize: 14 }}>{error}</p>}
          <button type="submit" style={{ width: "100%", marginTop: 8 }}>
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
