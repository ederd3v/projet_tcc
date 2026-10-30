import Link from "next/link";
import { whatsappLinkGeneric, WHATSAPP_DISPLAY } from "@/lib/whatsapp";
import { CATEGORIAS } from "@/lib/categorias";

// Pendência aberta no HANDOFF (item 5): não temos o @ real do perfil da
// Maruim ainda. Deixe NEXT_PUBLIC_INSTAGRAM_URL vazio até confirmar com o
// Jaisson — o ícone só aparece quando essa env var for preenchida, pra não
// repetir o bug do site publicado (`instagram.com` puro, sem destino real).
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

const MARCA = [
  { href: "/sobre", label: "Nossa história" },
  { href: "/contato", label: "Contato" },
];

// Nome completo da linha no rodapé ("Licores Finos"), diferente do rótulo
// curto da navegação ("Licores").
const NOME_COMPLETO: Record<string, string> = {
  licor: "Licores Finos",
  kombucha: "Kombuchas Vivas",
  ice: "Maruim Ice",
};

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-maruim-line bg-maruim-dark">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[160px] leading-none text-maruim-cream/[0.02]"
      >
        MARUIM
      </span>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-12 md:py-20">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-maruim-amber/30 bg-maruim-bg font-display text-lg text-maruim-amber">
              M
            </span>
            <div>
              <p className="font-display text-xl text-maruim-cream">Bebidas Maruim</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-maruim-muted">
                Desde 2014 · Joinville/SC
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-xs text-sm leading-[1.9] text-maruim-muted">
            Bebidas artesanais feitas em pequenos lotes, com ingredientes naturais e tempo de
            verdade. Sem pressa, sem atalhos.
          </p>
          <div className="mt-6 flex gap-3">
            {INSTAGRAM_URL && (
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-maruim-line text-maruim-muted transition-colors hover:border-maruim-amber hover:text-maruim-amber"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.07 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.8 3.8 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.07-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.2 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.2 8.8 2.2 12 2.2zm0 5.6a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4zm0 6.93a2.73 2.73 0 1 1 0-5.46 2.73 2.73 0 0 1 0 5.46zm5.35-7.1a.98.98 0 1 1-1.96 0 .98.98 0 0 1 1.96 0z" />
                </svg>
              </a>
            )}
            <a
              href={whatsappLinkGeneric()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-maruim-line text-maruim-muted transition-colors hover:border-maruim-amber hover:text-maruim-amber"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.33 11.89-11.89C23.95 5.34 18.6 0 12.05 0zm6.96 16.9c-.29.82-1.7 1.57-2.37 1.67-.6.09-1.37.13-2.2-.14-.51-.16-1.17-.38-2.01-.74-3.54-1.53-5.85-5.09-6.03-5.33-.17-.24-1.43-1.9-1.43-3.62s.9-2.57 1.22-2.92c.32-.35.7-.44.93-.44h.67c.21 0 .5-.08.79.6.29.7.99 2.42 1.08 2.6.09.17.15.38.03.62-.12.24-.18.38-.35.59-.18.2-.37.45-.53.61-.18.17-.36.36-.16.71.21.35.92 1.51 1.97 2.45 1.36 1.21 2.5 1.58 2.85 1.76.35.18.56.15.76-.09.21-.24.88-1.02 1.11-1.37.24-.35.47-.29.79-.17.32.11 2.03.96 2.38 1.13.35.18.58.26.67.41.09.14.09.82-.2 1.63z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-maruim-amber">Produtos</p>
          <ul className="space-y-3">
            {CATEGORIAS.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="text-sm text-maruim-muted transition-colors hover:text-maruim-cream"
                >
                  {NOME_COMPLETO[c.categoria] ?? c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-maruim-amber">Marca</p>
          <ul className="space-y-3">
            {MARCA.map((m) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  className="text-sm text-maruim-muted transition-colors hover:text-maruim-cream"
                >
                  {m.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={whatsappLinkGeneric()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-maruim-muted transition-colors hover:text-maruim-cream"
              >
                Pedidos
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-maruim-amber">
            Fale com a gente
          </p>
          <a
            href={whatsappLinkGeneric()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-2xl text-maruim-cream transition-colors hover:text-maruim-amber"
          >
            {WHATSAPP_DISPLAY}
          </a>
          <p className="mt-3 text-sm text-maruim-muted">Joinville · Santa Catarina</p>
          <p className="mt-1 text-sm text-maruim-muted">Seg a Sáb · 9h às 19h</p>
        </div>
      </div>

      <div className="relative border-t border-maruim-line px-6 py-6 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-[11px] text-maruim-muted md:flex-row">
          <p>© {new Date().getFullYear()} Bebidas Maruim · Todos os direitos reservados</p>
          <p className="uppercase tracking-[0.2em]">
            Beba com moderação · Venda proibida para menores de 18 anos
          </p>
        </div>
      </div>
    </footer>
  );
}
