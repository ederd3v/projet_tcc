//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: CAPA da home: foto das garrafas + título + botões.
//  ⚙️  COMO FUNCIONA: A foto é o maior elemento da tela (LCP), por isso baixa com prioridade alta. Os números ('11+ sabores') vêm do banco.
//  🎓 NA BANCA: Otimizada para o Lighthouse: carrega primeiro, em AVIF/WebP, no tamanho certo de cada tela.
//  ──────────────────────────────────────────────────────────────────────
import Image from "next/image";
import Link from "next/link";
import { whatsappLinkGeneric, WHATSAPP_DISPLAY } from "@/lib/whatsapp";
import { IconeWhatsApp } from "./IconeWhatsApp";

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
    <section className="relative overflow-hidden">
      <div className="relative mx-auto grid max-w-[1680px] grid-cols-1 md:min-h-[78vh] md:grid-cols-[46%_54%]">
      {/* Painel da esquerda: a capa (cinco licores) em tela cheia */}
      <div className="relative aspect-[3/4] overflow-hidden bg-black md:aspect-auto">
        {/* A capa é uma cena completa (fundo preto + sol âmbar) e ocupa o painel
            inteiro; o degradê à direita funde a foto com a coluna de texto. */}
        <Image
          src="/products/lineup.jpg"
          alt="Cinco licores Maruim lado a lado"
          fill
          priority
          // A capa é o LCP da home: fetchPriority alto faz o navegador baixá-la
          // antes do resto (o Lighthouse marcava 1,4 s de espera para começar).
          // Qualidade 75 em AVIF/WebP não tem diferença visível no fundo escuro e
          // corta ~60% do peso no celular.
          fetchPriority="high"
          sizes="(min-width: 768px) 46vw, 100vw"
          quality={75}
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[10%] bg-gradient-to-r from-transparent to-maruim-bg md:block" />
        {/* em monitores mais largos que o limite, a borda esquerda também se funde */}
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[8%] bg-gradient-to-l from-transparent to-maruim-bg min-[1700px]:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-b from-transparent to-maruim-bg md:hidden" />

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
          <span className="font-display text-[10px] uppercase leading-tight tracking-[0.12em] text-maruim-onAmber">
            Artesanal
            <br />
            · desde ·
            <br />
            2014
          </span>
        </div>
      </div>

      {/* Coluna da direita: o texto */}
      <div className="relative flex flex-col justify-center px-8 py-16 md:px-16 md:pb-14 md:pt-28 xl:px-24">
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

        <p className="mt-8 max-w-md animate-fade-up text-sm leading-[1.9] text-maruim-muted delay-300 2xl:max-w-lg 2xl:text-base">
          Produção artesanal com ingredientes naturais selecionados. Sabores únicos que capturam a
          essência de cada fruta, diretamente de Joinville para sua mesa.
        </p>

        <div className="mt-10 flex animate-fade-up flex-wrap items-center gap-3 delay-400">
          <Link
            href="/licores"
            className="rounded-sm bg-maruim-amber px-5 py-3 text-[12px] font-medium uppercase tracking-[0.1em] text-maruim-onAmber transition-colors hover:brightness-110"
          >
            Ver Cardápio Completo
          </Link>
          <a
            href={whatsappLinkGeneric()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm border border-maruim-amber/30 px-5 py-3 text-[12px] uppercase tracking-[0.1em] text-maruim-cream transition-colors hover:border-maruim-amber hover:text-maruim-amber"
          >
            <IconeWhatsApp className="h-3.5 w-3.5" />
            {WHATSAPP_DISPLAY}
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
      </div>
    </section>
  );
}
