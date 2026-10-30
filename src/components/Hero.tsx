import Image from "next/image";
import Link from "next/link";
import { whatsappLinkGeneric, WHATSAPP_DISPLAY } from "@/lib/whatsapp";

type HeroProps = {
  /** Contagem de produtos ativos por linha, vinda do banco (RF01/RF07). */
  contagem: { licor: number; kombucha: number; ice: number };
};

// Layout do site publicado: painel escuro à esquerda com o lineup de garrafas,
// coluna de texto à direita. Split 52/48 a partir de md, empilhado no celular.
export function Hero({ contagem }: HeroProps) {
  const numeros = [
    { valor: `${contagem.licor}+`, rotulo: "Sabores de Licor" },
    { valor: `${contagem.kombucha}+`, rotulo: "Kombuchas" },
    { valor: `${contagem.ice}`, rotulo: "Sabores Ice" },
  ];

  return (
    <section className="relative grid min-h-screen grid-cols-1 overflow-hidden md:grid-cols-[52%_48%]">
      {/* Painel da esquerda: garrafas sobre o halo */}
      <div className="relative flex items-center justify-center overflow-hidden bg-maruim-dark pt-24 md:pt-0">
        <div className="absolute h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,oklch(72%_0.14_70/0.18)_0%,transparent_70%)]" />

        <Image
          src="/products/lineup.png"
          alt="Linha de licores Maruim"
          width={896}
          height={1200}
          priority
          className="relative z-10 max-h-[80vh] w-auto animate-float object-contain"
        />

        {/* Trilho vertical — só no desktop, como no original */}
        <div className="absolute left-6 top-1/2 hidden -translate-y-1/2 flex-col gap-4 md:flex">
          {["Instagram", "WhatsApp", "Joinville · SC"].map((t) => (
            <span
              key={t}
              className="text-[10px] uppercase tracking-[0.2em] text-maruim-muted"
              style={{ writingMode: "vertical-rl" }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Selo artesanal girando devagar */}
        <div className="absolute bottom-8 right-8 z-10 flex h-24 w-24 animate-spin-slow items-center justify-center rounded-full bg-maruim-amber text-center">
          <span className="font-display text-[10px] uppercase leading-tight tracking-[0.12em] text-maruim-bg">
            Artesanal
            <br />
            · desde ·
            <br />
            2014
          </span>
        </div>
      </div>

      {/* Coluna da direita: o texto */}
      <div className="relative flex flex-col justify-center px-8 py-24 md:px-16">
        <p className="mb-6 flex animate-fade-up items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-maruim-amber">
          <span className="h-px w-8 bg-maruim-amber" />
          Joinville · Santa Catarina
        </p>

        <h1 className="animate-fade-up text-shadow-glow font-display text-[clamp(56px,7vw,96px)] leading-[0.95] text-maruim-cream delay-100">
          Bebidas
          <br />
          <span className="text-maruim-amber">Maruim</span>
        </h1>

        <p className="mt-2 animate-fade-up font-serif text-base italic text-maruim-muted delay-200 md:text-lg">
          Licores Finos · Kombuchas · Ice
        </p>

        <p className="mt-8 max-w-md animate-fade-up text-sm leading-[1.9] text-maruim-muted delay-300">
          Produção artesanal com ingredientes naturais selecionados. Sabores únicos que capturam a
          essência de cada fruta, diretamente de Joinville para sua mesa.
        </p>

        <div className="mt-10 flex animate-fade-up flex-wrap items-center gap-3 delay-400">
          <Link
            href="/licores"
            className="rounded-sm bg-maruim-amber px-5 py-3 text-[12px] font-medium uppercase tracking-[0.1em] text-maruim-bg transition-colors hover:bg-maruim-cream"
          >
            Ver Cardápio Completo
          </Link>
          <a
            href={whatsappLinkGeneric()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-maruim-amber/30 px-5 py-3 text-[12px] uppercase tracking-[0.1em] text-maruim-cream transition-colors hover:border-maruim-amber hover:text-maruim-amber"
          >
            📱 {WHATSAPP_DISPLAY}
          </a>
        </div>

        <div className="mt-12 flex gap-10 border-t border-maruim-line pt-8">
          {numeros.map((n) => (
            <div key={n.rotulo}>
              <div className="font-serif text-3xl font-bold text-maruim-amber">{n.valor}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-maruim-muted">
                {n.rotulo}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
