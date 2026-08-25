export const metadata = {
  title: "Sadabad Emlak CRM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, background: "#f5f5f5" }}>
        <nav style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #ddd", fontSize: 14 }}>
          <a href="/dashboard" style={{ marginRight: 16 }}>Dashboard</a>
          <a href="/leads" style={{ marginRight: 16 }}>Lead'ler</a>
          <a href="/properties" style={{ marginRight: 16 }}>Portföy</a>
          <a href="/tasks">Görevler</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
