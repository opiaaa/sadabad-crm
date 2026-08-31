"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "./UserMenu";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leads", label: "Lead'ler" },
  { href: "/talepler", label: "Talepler" },
  { href: "/properties", label: "Portföy" },
  { href: "/tasks", label: "Görevler" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <span className="logo">SADABAD EMLAK</span>
      <div className="site-header-right">
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
        <UserMenu />
      </div>
    </header>
  );
}
