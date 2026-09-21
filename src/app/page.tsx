import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { CardDestaque } from "@/components/CardDestaque";
import { whatsappLinkGeneric } from "@/lib/whatsapp";
import { CATEGORIAS } from "@/lib/categorias";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { SecaoTitulo } from "@/components/SecaoTitulo";
import { SecaoContato } from "@/components/SecaoContato";

export const revalidate = 0; // sempre lê do banco — catálogo é editado no CRM (RF07)


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

// Depoimentos publicados pela própria Bebidas Maruim no site anterior
// (sippable-tales.lovable.app), capturados em 15/09/2026 e conferidos no
// espelho em ~/Desktop/maruim-site — são conteúdo do cliente, não exemplos
// inventados. Procedência declarada a pedido da review de @max-d3v.
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
  // Desempate por criadoEm: sem ele, produtos de mesmo preço saem em ordem
  // indefinida e a vitrine muda sozinha entre requisições (review @max-d3v).
  const porPreco = { preco: "asc" } as const;
  const desempate = { criadoEm: "asc" } as const;
  // Os dois cards da home: primeiro os marcados como `destaque` no CRM; se
  // faltar algum, completa pelos mais baratos. O desempate por criadoEm evita
  // ordem indefinida entre produtos de mesmo preço (review @max-d3v).
  const doisDestaques = (categoria: "licor" | "kombucha" | "ice") =>
    prisma.produto.findMany({
      where: { categoria, ativo: true },
      orderBy: [{ destaque: "desc" }, porPreco, desempate],
      take: 2,
    });

  const [licores, kombuchas, ices, totalLicor, totalKombucha, totalIce] = await Promise.all([
    doisDestaques("licor"),
    doisDestaques("kombucha"),
    doisDestaques("ice"),
    // Contadas no banco, não fixas: com revalidate = 0 a home lê sempre do
    // banco, então número cravado no código contradiz o próprio RF07 — o dono
    // desativa um produto no CRM e o hero continuaria anunciando o total antigo
    // (review @max-d3v e @lufoanx).
    prisma.produto.count({ where: { categoria: "licor", ativo: true } }),
    prisma.produto.count({ where: { categoria: "kombucha", ativo: true } }),
    prisma.produto.count({ where: { categoria: "ice", ativo: true } }),
  ]);
  const contagem = { licor: totalLicor, kombucha: totalKombucha, ice: totalIce } as const;
  const produtosPorCategoria = { licor: licores, kombucha: kombuchas, ice: ices } as const;

  return (
    <>
      <Header />
      <main>
        <Hero contagem={contagem} />
        <Marquee />

        {CATEGORIAS.map(({ categoria, href, eyebrow, titulo, destaque, intro }, i) => {
          const nomeBase = titulo.replace(destaque, "").trim();
          const produtos = produtosPorCategoria[categoria];
          if (produtos.length === 0) return null;
          return (
            <section
              key={categoria}
              className={`px-6 py-24 md:px-12 md:py-28 ${i > 0 ? "border-t border-maruim-line" : ""}`}
            >
              <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                  <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-maruim-amber">
                    <span className="h-px w-6 bg-maruim-amber" />
                    {eyebrow}
                  </p>
                  <h2 className="mt-4 font-display text-4xl leading-[1.05] text-maruim-cream md:text-5xl">
                    {nomeBase} <em className="font-serif italic text-maruim-amber">{destaque}</em>
                  </h2>
                </div>
                <p className="max-w-xs text-sm leading-[1.8] text-maruim-muted md:text-right">{intro}</p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {produtos.map((p) => (
                  <CardDestaque
                    key={p.id}
                    nome={p.nome}
                    preco={p.preco}
                    fotoUrl={p.fotoUrl}
                    selo={p.selo}
                    href={href}
                  />
                ))}
              </div>

              <div className="mt-10 text-center">
                <Link href={href} className="font-display text-lg text-maruim-amber hover:underline">
                  Ver todos os {contagem[categoria]} sabores →
                </Link>
              </div>
            </section>
          );
        })}

        <section className="border-t border-maruim-line bg-maruim-dark px-6 py-24 md:px-12 md:py-28">
          <SecaoTitulo
            eyebrow="Simples assim"
            titulo="Como"
            destaque="pedir"
            apoio="Sem app, sem cadastro. Três passos pra ter a Maruim na sua mesa."
            centralizado
          />
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-px bg-maruim-line md:grid-cols-3">
            {PASSOS.map((passo) => (
              <div key={passo.numero} className="bg-maruim-dark p-10 transition-colors hover:bg-maruim-card">
                <p className="font-serif text-6xl font-bold text-maruim-amber/30">{passo.numero}</p>
                <p className="mt-4 font-display text-2xl text-maruim-cream">{passo.titulo}</p>
                <p className="mt-3 text-sm leading-[1.8] text-maruim-muted">{passo.descricao}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-maruim-line px-6 py-24 md:px-12 md:py-28">
          <SecaoTitulo eyebrow="O que dizem" titulo="Quem prova," destaque="volta." />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {DEPOIMENTOS.map((d) => (
              <div
                key={d.nome}
                className="border border-maruim-line bg-maruim-card p-8 transition-colors hover:border-maruim-amber/40"
              >
                <div className="flex gap-1 text-maruim-amber">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="mt-5 font-serif text-lg italic leading-[1.6] text-maruim-cream">
                  &ldquo;{d.texto}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-maruim-line pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-maruim-amber/15 font-display text-maruim-amber">
                    {d.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="font-display text-base text-maruim-cream">{d.nome}</p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-maruim-muted">{d.local}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <SecaoContato />
      </main>
      <Footer />
    </>
  );
}
