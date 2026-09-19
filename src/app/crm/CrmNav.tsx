"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const LINKS = [
  { href: "/crm", label: "Dashboard" },
  { href: "/crm/clientes", label: "Clientes" },
  { href: "/crm/produtos", label: "Produtos" },
  { href: "/crm/pedidos", label: "Pedidos" },
];

export function CrmNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === "/crm/login") return null;

  return (
    <header className="border-b border-maruim-amber/20 bg-maruim-bgAlt">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <nav className="flex gap-4 text-sm text-maruim-cream">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href ? "text-maruim-amberLight" : "hover:text-maruim-amberLight"}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-xs text-maruim-muted">
          {session?.user?.email && <span>{session.user.email}</span>}
          <button onClick={() => signOut({ callbackUrl: "/crm/login" })} className="hover:text-maruim-amberLight">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
