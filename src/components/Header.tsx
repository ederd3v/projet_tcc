import Link from "next/link";

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
          Bebidas Maruim
        </Link>
        <nav className="hidden gap-6 text-sm text-maruim-cream md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-maruim-amberLight">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
