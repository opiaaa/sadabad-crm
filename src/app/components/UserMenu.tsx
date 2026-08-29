"use client";
import { useSession, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data: session } = useSession();
  if (!session?.user) return null;

  return (
    <div className="user-menu">
      <span className="user-menu-name">{(session.user as any).name}</span>
      <button
        type="button"
        className="user-menu-signout"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Çıkış Yap
      </button>
    </div>
  );
}
