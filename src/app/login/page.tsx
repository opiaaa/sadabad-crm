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
    <div style={{ maxWidth: 360, margin: "80px auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h1 style={{ fontSize: 20 }}>Sadabad Emlak CRM</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 8, margin: "8px 0" }}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8, margin: "8px 0" }}
        />
        {error && <p style={{ color: "red", fontSize: 14 }}>{error}</p>}
        <button type="submit" style={{ width: "100%", padding: 10, marginTop: 8 }}>
          Giriş Yap
        </button>
      </form>
    </div>
  );
}
