//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Página /sobre: história da Maruim, fotos reais e o contato.
//  ⚙️  COMO FUNCIONA: Página estática (não lê banco). O antigo /contato redireciona para cá (#contato).
//  🎓 NA BANCA: Fotos reais dos produtos dão credibilidade; o contato junto evita uma página a mais.
//  ──────────────────────────────────────────────────────────────────────
import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SecaoContato } from "@/components/SecaoContato";
import { LogoMaruim } from "@/components/SeloMaruim";

export const metadata: Metadata = {
  title: "Sobre e contato — Bebidas Maruim",
  description:
    "A história da Bebidas Maruim, produtora artesanal de licores, kombuchas e ice em Joinville/SC, e como fazer seu pedido pelo WhatsApp.",
};

// Fotos reais dos produtos (feitas pela Maruim, não geradas): dão à página a
// prova de que as garrafas existem e quebram a "cara de IA" da vitrine.
const FOTOS = [
  { src: "/sobre/licor-de-cafe.jpg", alt: "Licor de café Maruim com grãos de café" },
  { src: "/sobre/licor-de-maracuja.jpg", alt: "Licor de maracujá Maruim com limões" },
  { src: "/sobre/licor-de-anis.jpg", alt: "Licor de anis Maruim sobre tecido claro" },
];

const NUMEROS = [
  { valor: "2014", rotulo: "Produzindo desde" },
  { valor: "22", rotulo: "Sabores entre licores, kombuchas e ice" },
  { valor: "100%", rotulo: "Pedidos direto com quem produz" },
];

export default function SobrePage() {
  return (
    <>
      <Header />
      <main>
        {/* Abertura: história + logo */}
        <section className="halo-bg px-6 pb-20 pt-32 md:px-12 md:pb-28 md:pt-40">
          <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-maruim-amber">
                <span className="h-px w-8 bg-maruim-amber" />
                Desde 2014 · Joinville/SC
              </p>
              <h1 className="mt-6 font-display text-[clamp(40px,5vw,64px)] leading-[1.02] text-maruim-cream">
                Feito à mão,
                <br />
                <em className="font-serif italic text-maruim-amber">em pequenos lotes.</em>
              </h1>
              <p className="mt-8 max-w-xl text-base leading-[1.9] text-maruim-muted">
                A Bebidas Maruim é uma produtora artesanal de Joinville, Santa Catarina. Desde 2014
                fazemos licores finos com frutas e especiarias, e hoje também kombuchas e o Maruim Ice,
                sempre em pequenos lotes, do jeito que a gente gosta de beber.
              </p>
              <p className="mt-4 max-w-xl text-base leading-[1.9] text-maruim-muted">
                Não tem carrinho nem checkout: você escolhe os sabores, chama no WhatsApp e fala direto
                com quem produz. A gente confirma valor, prazo e entrega.
              </p>
            </div>
            <LogoMaruim className="mx-auto h-56 w-64 text-maruim-cream md:h-72 md:w-80" />
          </div>
        </section>

        {/* Fotos reais */}
        <section className="border-t border-maruim-line px-6 py-20 md:px-12 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="relative aspect-[3/2] overflow-hidden border border-maruim-line">
              <Image
                src="/sobre/licores-lado-a-lado.jpg"
                alt="Cinco licores Maruim lado a lado"
                fill
                sizes="(min-width: 1152px) 1152px, 100vw"
                quality={85}
                className="object-cover"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {FOTOS.map((f) => (
                <div key={f.src} className="relative aspect-[2/3] overflow-hidden border border-maruim-line">
                  <Image
                    src={f.src}
                    alt={f.alt}
                    fill
                    sizes="(min-width: 1152px) 380px, 33vw"
                    quality={85}
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-maruim-muted">
              Fotos reais da nossa produção
            </p>

            <div className="mt-16 grid gap-10 border-t border-maruim-line pt-12 md:grid-cols-3">
              {NUMEROS.map((n) => (
                <div key={n.rotulo}>
                  <p className="font-serif text-4xl font-bold text-maruim-amber">{n.valor}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-maruim-muted">{n.rotulo}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contato (antes era a página /contato, que ficava solta) */}
        <SecaoContato id="contato" />
      </main>
      <Footer />
    </>
  );
}
