"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { whatsappLinkGeneric, WHATSAPP_DISPLAY } from "@/lib/whatsapp";
import { CATEGORIAS } from "@/lib/categorias";
import { BotaoTema } from "@/components/BotaoTema";
import { SeloMaruim } from "@/components/SeloMaruim";

// Navegação: Início, as três linhas de produto e Sobre (o contato agora mora
// dentro de /sobre#contato). As categorias vêm da fonte única para não repetir rota nem rótulo
// (review de @sidneyoliveiraj no PR #1).
const NAV = [
  { href: "/", label: "Início" },
  ...CATEGORIAS.map((c) => ({ href: c.href, label: c.label })),
  { href: "/sobre", label: "Sobre" },
];

export function Header() {
  const rota = usePathname();
  // Ao descer a página o topo encolhe e ganha fundo sólido desfocado.
  const [rolou, setRolou] = useState(false);
  useEffect(() => {
    const ver = () => setRolou(window.scrollY > 40);
    ver();
    window.addEventListener("scroll", ver, { passive: true });
    return () => window.removeEventListener("scroll", ver);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        rolou
          ? "bg-maruim-bg/85 shadow-lg shadow-black/10 backdrop-blur-md"
          : "bg-gradient-to-b from-maruim-bg/95 to-transparent [:root[data-theme=light]_&]:bg-maruim-bg/85 [:root[data-theme=light]_&]:backdrop-blur-md"
      }`}
    >
      <div className={`flex items-center justify-between px-6 transition-all duration-300 md:px-12 ${rolou ? "py-2.5" : "py-5"}`}>
        <Link href="/" className="flex items-center gap-3">
          <SeloMaruim className={`text-maruim-cream transition-all duration-300 ${rolou ? "h-9 w-9" : "h-12 w-12"}`} />
          <span>
            <span className="block font-display text-xl tracking-wider text-maruim-cream">Maruim</span>
            <span className="block text-[9px] uppercase tracking-[0.25em] text-maruim-muted">
              Bebidas Artesanais
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => {
            const ativo = item.href === "/" ? rota === "/" : rota.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`text-[13px] uppercase tracking-[0.1em] transition-colors hover:text-maruim-cream ${
                  ativo ? "text-maruim-amber" : "text-maruim-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <BotaoTema />
          <a
          href={whatsappLinkGeneric()}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-sm bg-maruim-amber px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] text-maruim-onAmber transition-colors hover:brightness-110 "
        >
          Pedir
          </a>
        </div>

        <div className="flex items-center gap-3 md:hidden">
        <BotaoTema />
        <details>
          <summary
            aria-label="Menu"
            className="cursor-pointer list-none text-maruim-cream [&::-webkit-details-marker]:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" />
            </svg>
          </summary>
          <div className="absolute inset-x-0 top-full flex flex-col gap-4 border-t border-maruim-line bg-maruim-bg px-6 py-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] uppercase tracking-[0.1em] text-maruim-cream"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={whatsappLinkGeneric()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm bg-maruim-amber px-5 py-3 text-center text-[12px] font-medium uppercase tracking-[0.1em] text-maruim-onAmber"
            >
              {WHATSAPP_DISPLAY}
            </a>
          </div>
        </details>
        </div>
      </div>
    </header>
  );
}
