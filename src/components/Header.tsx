import Link from "next/link";
import { whatsappLinkGeneric } from "@/lib/whatsapp";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/licores", label: "Licores" },
  { href: "/kombuchas", label: "Kombuchas" },
  { href: "/ice", label: "Ice" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  return (
    <header className="border-b border-maruim-amber/20 bg-maruim-bg/95 sticky top-0 z-40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-xl text-maruim-amberLight">
          Maruim <span className="text-maruim-cream">Bebidas Artesanais</span>
        </Link>
        <nav className="hidden gap-6 text-sm text-maruim-cream md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-maruim-amberLight">
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href={whatsappLinkGeneric()}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-maruim-amber px-4 py-2 text-sm font-medium text-maruim-bg hover:bg-maruim-amberLight"
        >
          Pedir
        </a>
      </div>
    </header>
  );
}
