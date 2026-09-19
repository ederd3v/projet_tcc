import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { whatsappLinkGeneric } from "@/lib/whatsapp";

export const revalidate = 0; // sempre lê do banco — catálogo é editado no CRM (RF07)

const CATEGORIAS = [
  {
    categoria: "licor" as const,
    href: "/licores",
    titulo: "Nossos Licores",
    destaque: "Licores",
    intro:
      "Produzidos artesanalmente com frutas frescas e técnicas tradicionais. Cada garrafa, uma experiência única.",
  },
  {
    categoria: "kombucha" as const,
    href: "/kombuchas",
    titulo: "Kombuchas Vivas",
    destaque: "Vivas",
    intro:
      "Fermentadas em chá verde e preto por até 21 dias. Probióticas, vivas e naturalmente gaseificadas.",
  },
  {
    categoria: "ice" as const,
    href: "/ice",
    titulo: "Maruim Ice",
    destaque: "Ice",
    intro: "A versão mais refrescante. Pronto pra beber, em quatro sabores. Só R$ 7,50 cada.",
  },
];

const PASSOS = [
  {
    numero: "01",
    titulo: "Escolha",
    descricao: "Navegue pelos sabores e anote os que mais te chamaram.",
  },
  {
    numero: "02",
    titulo: "Chame no Zap",
    descricao: "Manda a lista no nosso WhatsApp. A gente confirma valor e prazo.",
  },
  {
    numero: "03",
    titulo: "Receba",
    descricao: "Pague no PIX e receba em casa. Em Joinville, no mesmo dia.",
  },
];

const DEPOIMENTOS = [
  {
    nome: "Camila R.",
    local: "Joinville",
    texto: "O licor de jabuticaba é absurdo. Já é tradição lá em casa nos fins de semana.",
  },
  {
    nome: "Rafael M.",
    local: "Itapoá",
    texto:
      "Comprei a kombucha de morango com hibisco achando que ia ser doce demais. Errei feio. Perfeita.",
  },
  {
    nome: "Juliana S.",
    local: "Joinville",
    texto: "Atendimento pelo zap é direto, recebi no mesmo dia. Já estou no terceiro pedido.",
  },
];

export default async function HomePage() {
  // RF01: landing exibe catálogo com produtos ativo=true, direto do banco.
  const [licores, kombuchas, ices] = await Promise.all([
    prisma.produto.findMany({ where: { categoria: "licor", ativo: true }, orderBy: { preco: "asc" }, take: 2 }),
    prisma.produto.findMany({ where: { categoria: "kombucha", ativo: true }, orderBy: { preco: "asc" }, take: 2 }),
    prisma.produto.findMany({ where: { categoria: "ice", ativo: true }, orderBy: { preco: "asc" }, take: 2 }),
  ]);
  const contagem = { licor: 11, kombucha: 7, ice: 4 } as const;
  const produtosPorCategoria = { licor: licores, kombucha: kombuchas, ice: ices } as const;

  return (
    <>
      <Header />
      <main className="halo-bg">
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center">
          <div className="relative h-64 w-64">
            <Image src="/products/lineup.png" alt="Linha Bebidas Maruim" fill className="object-contain" />
          </div>
          <h1 className="font-display text-4xl leading-tight text-maruim-amberLight md:text-5xl">
            Bebidas
            <br />
            Maruim
          </h1>
          <p className="font-serif text-lg text-maruim-amber">Licores Finos · Kombuchas · Ice</p>
          <p className="max-w-xl text-maruim-cream">
            Produção artesanal com ingredientes naturais selecionados. Sabores únicos que capturam a
            essência de cada fruta, direto de Joinville/SC pra sua casa.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-maruim-muted">
            <span>11+ sabores de Licor</span>
            <span>7+ Kombuchas</span>
            <span>4 sabores de Ice</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/licores" className="rounded-full bg-maruim-amber px-6 py-3 text-maruim-bg">
              Ver Cardápio Completo
            </Link>
            <a
              href={whatsappLinkGeneric()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-maruim-amber px-6 py-3 text-maruim-amberLight hover:bg-maruim-amber/10"
            >
              📱 (47) 9 9240-1430
            </a>
          </div>
        </section>

        {CATEGORIAS.map(({ categoria, href, titulo, destaque, intro }) => {
          const nomeBase = titulo.replace(destaque, "").trim();
          const produtos = produtosPorCategoria[categoria];
          if (produtos.length === 0) return null;
          return (
            <section key={categoria} className="mx-auto max-w-6xl px-4 pb-20">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-maruim-amberLight">
                    {nomeBase} <em className="text-maruim-amber">{destaque}</em>
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-maruim-cream">{intro}</p>
                </div>
                <Link href={href} className="whitespace-nowrap text-sm text-maruim-amber hover:text-maruim-amberLight">
                  Ver tudo →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {produtos.map((p) => (
                  <ProductCard
                    key={p.id}
                    nome={p.nome}
                    descricao={p.descricao}
                    preco={p.preco}
                    fotoUrl={p.fotoUrl}
                    volumeMl={p.volumeMl}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs text-maruim-muted">
                {contagem[categoria]} sabores disponíveis no total.
              </p>
            </section>
          );
        })}

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <h2 className="mb-10 text-center font-serif text-2xl text-maruim-amberLight">
            Como <em className="text-maruim-amber">pedir</em>
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {PASSOS.map((passo) => (
              <div key={passo.numero} className="text-center">
                <p className="font-display text-3xl text-maruim-amber">{passo.numero}</p>
                <h3 className="mt-2 font-serif text-lg text-maruim-amberLight">{passo.titulo}</h3>
                <p className="mt-2 text-sm text-maruim-cream">{passo.descricao}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {DEPOIMENTOS.map((d) => (
              <div key={d.nome} className="halo-bg rounded-xl border border-maruim-amber/20 p-6">
                <p className="text-maruim-amber">★★★★★</p>
                <p className="mt-3 text-sm text-maruim-cream">&ldquo;{d.texto}&rdquo;</p>
                <p className="mt-4 text-sm font-medium text-maruim-amberLight">
                  {d.nome} <span className="text-maruim-muted">· {d.local}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
