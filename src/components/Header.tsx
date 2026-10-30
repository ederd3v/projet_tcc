"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { whatsappLinkGeneric } from "@/lib/whatsapp";
import { CATEGORIAS } from "@/lib/categorias";

// Navegação do site publicado: Início, as três linhas de produto, Sobre e
// Contato. As categorias vêm da fonte única para não repetir rota nem rótulo
// (review de @sidneyoliveiraj no PR #1).
const NAV = [
  { href: "/", label: "Início" },
  ...CATEGORIAS.map((c) => ({ href: c.href, label: c.label })),
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  const rota = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-maruim-bg/95 to-transparent transition-all duration-300">
      <div className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-maruim-amber/25 bg-maruim-bg font-display text-lg text-maruim-amber">
            M
          </span>
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

        <a
          href={whatsappLinkGeneric()}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-sm bg-maruim-amber px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] text-maruim-bg transition-colors hover:bg-maruim-cream md:block"
        >
          Pedir
        </a>

        <details className="md:hidden">
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
              className="rounded-sm bg-maruim-amber px-5 py-3 text-center text-[12px] font-medium uppercase tracking-[0.1em] text-maruim-bg"
            >
              (47) 9 9240-1430
            </a>
          </div>
        </details>
      </div>
    </header>
  );
}
