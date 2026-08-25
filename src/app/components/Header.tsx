"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leads", label: "Lead'ler" },
  { href: "/properties", label: "Portföy" },
  { href: "/tasks", label: "Görevler" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <span className="logo">SADABAD EMLAK</span>
      <nav>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "active" : ""}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
