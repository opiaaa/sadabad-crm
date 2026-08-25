import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "Sadabad Emlak CRM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
